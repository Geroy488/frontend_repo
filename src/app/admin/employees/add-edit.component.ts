// file: employees/add-edit.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PositionsService } from '@app/_services/position.service';

import { EmployeesService, AlertService, AccountService } from '@app/_services';

import { AbstractControl, ValidatorFn } from '@angular/forms';

// Custom validator: hireDate cannot be in a future year
function maxYearValidator(maxYear: number): ValidatorFn {
return (control: AbstractControl) => {
if (!control.value) return null; // allow empty here, required handled separately
const selectedYear = new Date(control.value).getFullYear();
return selectedYear > maxYear ? { maxYear: { value: control.value } } : null;
};
}

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
currentYear: number = new Date().getFullYear();
currentDepartment: string | null = null;

accounts: any[] = []; // accounts for dropdown
departments: any[] = [];
positions: any[] = [];

constructor(
  private formBuilder: FormBuilder,
  private route: ActivatedRoute,
  private router: Router,
  private employeeService: EmployeesService,
  private accountService: AccountService,
  private alertService: AlertService,
  private positionsService: PositionsService   // ✅ new
) {}


ngOnInit() {
  this.initForm();

  // Load accounts (same as before)
  this.accountService.getAll()
    .pipe(first())
    .subscribe({
      next: (accounts: any[]) => {
        this.employeeService.getAll()
          .pipe(first())
          .subscribe({
            next: (employees: any[]) => {
              const usedAccountIds = employees.map(e => e.accountId);
              let currentAccountId: number | null = null;

              if (this.id) {
                this.employeeService.getById(this.id)
                  .pipe(first())
                  .subscribe(emp => {
                    currentAccountId = emp.accountId;

                    this.accounts = accounts.filter(acc =>
                      acc.status === 'Active' &&
                      (!usedAccountIds.includes(acc.id) || acc.id === currentAccountId)
                    );
                  });
              } else {
                this.accounts = accounts.filter(acc =>
                  acc.status === 'Active' && !usedAccountIds.includes(acc.id)
                );
              }
            },
            error: (err) => console.error('Error loading employees', err)
          });
      },
      error: (err) => console.error('Error loading accounts', err)
    });

  // Load positions
  this.positionsService.getAll()
    .pipe(first())
    .subscribe({
      next: (pos: any[]) => this.positions = pos,
      error: (err) => console.error('Error loading positions', err)
    });

  // Track current department
  let currentDepartmentName: string | null = null;

  // Check if edit or create
  this.routeSub = this.route.params.subscribe(params => {
    this.id = params['id'];
    this.title = this.id ? 'Edit Employee' : 'Create Employee';

    if (this.id) {
      this.loading = true;
      this.employeeService.getById(this.id)
        .pipe(first())
        .subscribe({
          next: (emp: any) => {
            currentDepartmentName = emp.department;

            // Load departments but exclude current one
            this.employeeService.getDepartments()
              .pipe(first())
              .subscribe({
                next: (depts: any[]) => {
                  this.departments = depts.filter(d => d.name !== currentDepartmentName);
                  this.form.patchValue({
                    department: emp.department,
                  });
                },
                error: (err) => console.error('Error loading departments', err)
              });

            // Patch full form
            this.form.patchValue({
              employeeId: emp.employeeId,
              accountId: emp.accountId,
              position: emp.position,
              hireDate: emp.hireDate,
              status: emp.status ?? 'Active'
            });

            // Store current department for display
            this.currentDepartment = currentDepartmentName;

            this.loading = false;
          },
          error: () => this.loading = false
        });

    } else {
      // Create mode — load all departments
      this.employeeService.getDepartments()
        .pipe(first())
        .subscribe({
          next: (depts: any[]) => this.departments = depts,
          error: (err) => console.error('Error loading departments', err)
        });

      // Get next employeeId
      this.employeeService.getNextId()
        .pipe(first())
        .subscribe({
          next: (res: any) => this.form.get('employeeId')?.setValue(res.nextId),
          error: (err) => console.error('Error loading next employeeId', err)
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
  employeeId: [''],
  accountId: ['', Validators.required],
  position: ['', Validators.required],
  department: ['', Validators.required],
  hireDate: ['', [Validators.required, maxYearValidator(this.currentYear)]],
  status: ['', Validators.required]
  });
}

get f() { return this.form.controls; }

onSubmit() {
this.submitted = true;
this.alertService.clear();


if (this.form.invalid) return;

this.submitting = true;

const raw = this.form.getRawValue();
let payload: any;
let request$;
let message: string;

if (this.id) {
  payload = { ...raw };
  request$ = this.employeeService.update(this.id!, payload);
  message = 'Employee updated';
} else {
  payload = { ...raw };
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
