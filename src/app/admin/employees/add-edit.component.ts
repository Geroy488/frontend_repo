import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { EmployeesService, AlertService, AccountService } from '@app/_services';

@Component({
  selector: 'app-employee-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;
  private routeSub!: Subscription;

  // 👇 add accounts array
  accounts: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeesService,
    private accountService: AccountService,   // 👈 inject account service
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // load accounts (only Active ones)
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.accounts = data.filter(acc => acc.status === 'Active');
        },
        error: (err) => {
          console.error('Error loading accounts', err);
        }
      });

    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.initForm();

      this.title = this.id ? 'Edit Employee' : 'Create Employee';

      if (this.id) {
        this.loading = true;
        this.employeeService.getById(this.id)
          .pipe(first())
          .subscribe({
            next: (x: any) => {
              this.form.patchValue({
                employeeId: x.employeeId,
                accountId: x.accountId,   // 👈 matches dropdown
                position: x.position,
                department: x.department,
                hireDate: x.hireDate,
                status: x.status ?? 'Active'
              });
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  private initForm() {
    this.submitted = false;
    this.submitting = false;
    this.loading = false;

    this.form = this.formBuilder.group({
      //employeeId: ['', Validators.required],
      accountId: ['', Validators.required],   // 👈 fixed: should be accountId
      position: ['', Validators.required],
      department: ['', Validators.required],
      hireDate: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.submitting = true;
    const payload = { ...this.form.value };

    let request$;
    let message: string;

    if (this.id) {
      request$ = this.employeeService.update(this.id!, payload);
      message = 'Employee updated';
    } else {
      request$ = this.employeeService.create(payload);
      message = 'Employee created';
    }

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        this.router.navigateByUrl('/admin/employees');
      },
      error: (error: any) => {
        this.alertService.error(error);
        this.submitting = false;
      }
    });
  }
}
