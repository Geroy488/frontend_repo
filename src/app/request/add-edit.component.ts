import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { RequestsService, EmployeesService, AlertService } from '@app/_services';
import { AccountService } from '@app/_services/account.service';
import { Role } from '@app/_models';

@Component({
  selector: 'app-request-add-edit',
  templateUrl: './add-edit.component.html'
})
export class RequestAddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;
  private routeSub!: Subscription;

  employees: any[] = [];
  approvers: any[] = [];
  currentUser: any;
  isAdmin = false;
  employeeLogin: string = '';

  submitToAdmin = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    private employeesService: EmployeesService,
    private alertService: AlertService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.currentUser = this.accountService.accountValue;
    this.isAdmin = this.currentUser?.role === Role.Admin;

    this.initForm();
    this.loadApprovers();

    if (this.isAdmin) {
      this.loadEmployees();
    } else {
      // ✅ Auto-fill logged-in user info
      const emp = this.currentUser?.employee;
      if (emp) {
        this.form.patchValue({ employeeId: emp.id });
        this.employeeLogin = emp.employeeId; // e.g. EMP001
      } else if (this.currentUser?.employeeId) {
        this.form.patchValue({ employeeId: this.currentUser.employeeId });
        this.employeeLogin = this.currentUser.employeeId;
      }
    }

    // Load edit data if applicable
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.title = this.id ? 'Edit Request' : 'Create Request';

      if (this.id) {
        this.loading = true;
        this.requestsService.getById(+this.id)
          .pipe(first())
          .subscribe({
            next: (x: any) => {
              this.items.clear();
              if (x.items) {
                const parts = x.items.split(',').map((s: string) => s.trim());
                parts.forEach((p: string) => {
                  const match = p.match(/^(.*)\((\d+)\)$/);
                  if (match) {
                    this.items.push(this.formBuilder.group({
                      name: [match[1].trim(), Validators.required],
                      quantity: [parseInt(match[2], 10), [Validators.required, Validators.min(1)]]
                    }));
                  }
                });
              }
              if (this.items.length === 0) this.addItem();

              this.form.patchValue({
                type: x.type,
                employeeId: x.employeeId,
                approverId: x.approverId,
                status: x.status ?? 'Pending'
              });

              this.loading = false;
            },
            error: () => this.loading = false
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      employeeId: ['', Validators.required],
      approverId: ['', Validators.required],
      type: ['', Validators.required],
      items: this.formBuilder.array([]),
      status: ['Pending']  // ✅ Default to Pending for better UX
    });
    this.addItem();
  }

  private loadEmployees() {
    this.loading = true;
    this.employeesService.getAllEmployees()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.employees = data;
          this.loading = false;
        },
        error: err => {
          console.error('Error loading employees', err);
          this.loading = false;
        }
      });
  }

  private loadApprovers() {
    this.loading = true;
    this.employeesService.getAllEmployees()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          // ✅ Example: only “Head” or “Manager” can be approvers (if you want)
          this.approvers = data.filter(emp => emp.account?.role === 'Manager' || emp.account?.role === 'Head');
          if (this.approvers.length === 0) {
            this.approvers = data; // fallback: show all
          }
          this.loading = false;
        },
        error: err => {
          console.error('Error loading approvers', err);
          this.loading = false;
        }
      });
  }

  get f() { return this.form.controls; }
  get items(): FormArray { return this.form.get('items') as FormArray; }

  addItem() {
    const itemForm = this.formBuilder.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit(submitFlag: boolean = false) {
    this.submitted = true;
    this.alertService.clear();
    this.submitToAdmin = submitFlag;

    if (this.form.invalid) return;

    this.submitting = true;

    const payload = { ...this.form.value };

    // Convert items array → string format
    if (Array.isArray(payload.items)) {
      payload.items = payload.items
        .map((x: any) => `${x.name} (${x.quantity})`)
        .join(', ');
    }

    // Update status
    payload.status = this.submitToAdmin ? 'Pending' : 'Draft';

    let request$;
    let message: string;

    if (this.id) {
      request$ = this.requestsService.update(+this.id, payload);
      message = this.submitToAdmin ? 'Request submitted' : 'Request saved';
    } else {
      request$ = this.requestsService.create(payload, this.currentUser);
      message = this.submitToAdmin ? 'Request submitted' : 'Request saved';
    }

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        this.router.navigateByUrl('/requests');
      },
      error: (error: any) => {
        this.alertService.error(error?.message || 'Failed to save request');
        this.submitting = false;
      }
    });
  }
}
