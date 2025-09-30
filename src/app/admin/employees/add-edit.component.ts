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

// 1️⃣ Load accounts but exclude those already linked to employees
// inside ngOnInit(), after loading accounts
this.accountService.getAll()
  .pipe(first())
  .subscribe({
    next: (accounts: any[]) => {
      this.employeeService.getAll()
        .pipe(first())
        .subscribe({
          next: (employees: any[]) => {
            const usedAccountIds = employees.map(e => e.accountId);

            // 🔹 If editing, allow current account even if it's "used"
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
              // Creating new employee → exclude all used accounts
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


  // 3️⃣ Load positions dynamically
this.positionsService.getAll()
  .pipe(first())
  .subscribe({
    next: (pos: any[]) => {
      this.positions = pos;
    },
    error: (err) => console.error('Error loading positions', err)
  });


// 2️⃣ Load departments dynamically
this.employeeService.getDepartments()
  .pipe(first())
  .subscribe({
    next: (depts: any[]) => {
      this.departments = depts;
    },
    error: (err) => console.error('Error loading departments', err)
  });

// 3️⃣ Check route params for edit vs. create
this.routeSub = this.route.params.subscribe(params => {
  this.id = params['id'];
  this.title = this.id ? 'Edit Employee' : 'Create Employee';

  if (this.id) {
    // Editing existing employee
    this.loading = true;
    this.employeeService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (x: any) => {
          this.form.patchValue({
            employeeId: x.employeeId,
            accountId: x.accountId,
            position: x.position,
            department: x.department,
            hireDate: x.hireDate,
            status: x.status ?? 'Active'
          });
          this.loading = false;
        },
        error: () => this.loading = false
      });
  } else {
    // Creating new employee → get next employeeId
    this.employeeService.getNextId()
      .pipe(first())
      .subscribe({
        next: (res: any) => {
          this.form.get('employeeId')?.setValue(res.nextId);
        },
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
