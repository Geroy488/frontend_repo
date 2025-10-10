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
  currentUser: any;
  isAdmin = false;

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
    // ✅ Get current user info
    this.currentUser = this.accountService.accountValue;
    this.isAdmin = this.currentUser?.role === Role.Admin;

    this.initForm();

    if (this.isAdmin) {
      this.loadEmployees(); // only admins need dropdown
    } else {
      // ✅ Auto-set employeeId for normal users
      if (this.currentUser?.employee?.id) {
    // if your currentUser object already includes employee object
    this.form.patchValue({ employeeId: this.currentUser.employee.id });
    } else if (this.currentUser?.employeeId) {
    // fallback
    this.form.patchValue({ employeeId: this.currentUser.employeeId });
    }
}

    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.title = this.id ? 'Edit Request' : 'Create Request';

      if (this.id) {
        this.loading = true;
        this.requestsService.getById(+this.id)
          .pipe(first())
          .subscribe({
            next: (x: any) => {
              // reset items
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

  private loadEmployees() {
    this.loading = true;
    this.employeesService.getAllEmployees()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.employees = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error loading employees', err);
          this.loading = false;
        }
      });
  }

  private initForm() {
    this.form = this.formBuilder.group({
      type: ['', Validators.required],
      employeeId: ['', Validators.required],
      items: this.formBuilder.array([]),
      status: ['Pending', Validators.required]
    });
    this.addItem();
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

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.submitting = true;
    const payload = { ...this.form.value };

    console.log('🟢 Sending payload to backend:', payload); // Add this line

    if (Array.isArray(payload.items)) {
      payload.items = payload.items
        .map((x: any) => `${x.name} (${x.quantity})`)
        .join(', ');
    }

    let request$;
    let message: string;

    if (this.id) {
      request$ = this.requestsService.update(+this.id, payload);
      message = 'Request updated';
    } else {
      request$ = this.requestsService.create(payload);
      message = 'Request created';
    }

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        // ✅ Redirect based on role
        if (this.isAdmin) {
          this.router.navigateByUrl('/admin/requests');
        } else {
          this.router.navigateByUrl('/requests');
        }
      },
      error: (error: any) => {
        this.alertService.error(error?.message || 'Failed to save request');
        this.submitting = false;
      }
    });
  }
}
