// // file: employees/add-edit.component.ts
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
// import { first } from 'rxjs/operators';
// import { Subscription } from 'rxjs';
// import { PositionsService } from '@app/_services/position.service';
// import { EmployeesService, AlertService, AccountService } from '@app/_services';

// // Custom validator: hireDate cannot be in a future year
// function maxYearValidator(maxYear: number): ValidatorFn {
//   return (control: AbstractControl) => {
//     if (!control.value) return null; // allow empty, handled by required validator
//     const selectedYear = new Date(control.value).getFullYear();
//     return selectedYear > maxYear ? { maxYear: { value: control.value } } : null;
//   };
// }

// @Component({
//   selector: 'app-employee-add-edit',
//   templateUrl: './add-edit.component.html'
// })
// export class AddEditComponent implements OnInit, OnDestroy {
//   form!: FormGroup;
//   id?: string;
//   title!: string;
//   loading = false;
//   submitting = false;
//   submitted = false;
//   private routeSub!: Subscription;
//   currentYear: number = new Date().getFullYear();

//   currentDepartment: string | null = null;
//   currentPosition: string | null = null;

//   accounts: any[] = [];
//   departments: any[] = [];
//   positions: any[] = [];

//   isCurrentPosDisabled: boolean = false;

//   constructor(
//     private formBuilder: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private employeeService: EmployeesService,
//     private accountService: AccountService,
//     private alertService: AlertService,
//     private positionsService: PositionsService
//   ) {}

//   ngOnInit() {
//     this.initForm();

//     // Load available accounts
//     this.accountService.getAll()
//       .pipe(first())
//       .subscribe({
//         next: (accounts: any[]) => {
//           this.employeeService.getAll()
//             .pipe(first())
//             .subscribe({
//               next: (employees: any[]) => {
//                 const usedAccountIds = employees.map(e => e.accountId);
//                 if (this.id) {
//                   this.employeeService.getById(this.id)
//                     .pipe(first())
//                     .subscribe(emp => {
//                       const currentAccountId = emp.accountId;
//                       this.accounts = accounts.filter(acc =>
//                         acc.status === 'Active' &&
//                         (!usedAccountIds.includes(acc.id) || acc.id === currentAccountId)
//                       );
//                     });
//                 } else {
//                   this.accounts = accounts.filter(acc =>
//                     acc.status === 'Active' && !usedAccountIds.includes(acc.id)
//                   );
//                 }
//               },
//               error: (err) => console.error('Error loading employees', err)
//             });
//         },
//         error: (err) => console.error('Error loading accounts', err)
//       });

//     // Check if edit or create
//     this.routeSub = this.route.params.subscribe(params => {
//       this.id = params['id'];
//       this.title = this.id ? 'Edit Employee' : 'Create Employee';

//       if (this.id) {
//         // 🔹 EDIT MODE
//         this.loading = true;
//         this.employeeService.getById(this.id)
//           .pipe(first())
//           .subscribe({
//             next: (emp: any) => {
//               this.currentDepartment = emp.department;
//               this.currentPosition = emp.position;

//               // ✅ Load departments
//               this.employeeService.getDepartments()
//                 .pipe(first())
//                 .subscribe({
//                   next: (depts: any[]) => {
//                     this.departments = depts.filter(d => d.name !== emp.department);
//                   },
//                   error: (err) => console.error('Error loading departments', err)
//                 });

//               // ✅ NEW SMART POSITION LOGIC
//               this.positionsService.getEnabled()
//                 .pipe(first())
//                 .subscribe({
//                   next: (enabledPositions: any[]) => {
//                     this.employeeService.getAll()
//                       .pipe(first())
//                       .subscribe({
//                         next: (employees: any[]) => {
//                           const usedPositions = employees
//                             .filter(e => e.employeeId !== emp.employeeId) // exclude self
//                             .map(e => e.position?.toLowerCase());

//                           this.positions = enabledPositions.filter(pos => {
//                             const posName = pos.name.toLowerCase();
//                             const isManagerOrHead = posName.includes('manager') || posName.includes('head');

//                             // ✅ Hide if Manager/Head already taken by others
//                             if (isManagerOrHead && usedPositions.includes(posName)) {
//                               return false;
//                             }

//                             // ✅ Always include their current position
//                             if (pos.name === emp.position) return true;

//                             return true;
//                           });

//                           // ✅ Patch form fields
//                           this.form.patchValue({
//                             employeeId: emp.employeeId,
//                             accountId: emp.accountId,
//                             position: emp.position,
//                             department: emp.department,
//                             hireDate: emp.hireDate,
//                             status: emp.status ?? 'Active'
//                           });

//                           this.loading = false;
//                         },
//                         error: (err) => console.error('Error loading employees', err)
//                       });
//                   },
//                   error: (err) => console.error('Error loading positions', err)
//                 });
//             },
//             error: () => this.loading = false
//           });

//       } else {
//         // 🔹 CREATE MODE
//         this.employeeService.getDepartments()
//           .pipe(first())
//           .subscribe({
//             next: (depts: any[]) => this.departments = depts,
//             error: (err) => console.error('Error loading departments', err)
//           });

//         // ✅ SMART create logic for positions
//         this.positionsService.getEnabled()
//           .pipe(first())
//           .subscribe({
//             next: (enabledPositions: any[]) => {
//               this.employeeService.getAll()
//                 .pipe(first())
//                 .subscribe({
//                   next: (employees: any[]) => {
//                     const usedPositions = employees.map(e => e.position?.toLowerCase());

//                     this.positions = enabledPositions.filter(pos => {
//                       const posName = pos.name.toLowerCase();
//                       const isManagerOrHead = posName.includes('manager') || posName.includes('head');
//                       return !(isManagerOrHead && usedPositions.includes(posName));
//                     });
//                   },
//                   error: (err) => console.error('Error loading employees', err)
//                 });
//             },
//             error: (err) => console.error('Error loading positions', err)
//           });

//         // ✅ Get next employee ID
//         this.employeeService.getNextId()
//           .pipe(first())
//           .subscribe({
//             next: (res: any) => this.form.get('employeeId')?.setValue(res.nextId),
//             error: (err) => console.error('Error loading next employeeId', err)
//           });
//       }
//     });
//   }

//   // ✅ Used in template to mark current position as disabled
//   isCurrentPositionDisabled(): boolean {
//     const current = this.positions.find(p => p.name === this.currentPosition);
//     return current ? current.status === 'DISABLE' : false;
//   }

//   // ✅ Clean up subscription
//   ngOnDestroy() {
//     if (this.routeSub) this.routeSub.unsubscribe();
//   }

//   private initForm() {
//     this.submitted = false;
//     this.submitting = false;
//     this.loading = false;

//     this.form = this.formBuilder.group({
//       employeeId: [''],
//       accountId: ['', Validators.required],
//       position: ['', Validators.required],
//       department: ['', Validators.required],
//       hireDate: ['', [Validators.required, maxYearValidator(this.currentYear)]],
//       status: ['', Validators.required]
//     });
//   }

//   get f() { return this.form.controls; }

//   onSubmit() {
//     this.submitted = true;
//     this.alertService.clear();
//     if (this.form.invalid) return;

//     this.submitting = true;
//     const payload = { ...this.form.getRawValue() };

//     const request$ = this.id
//       ? this.employeeService.update(this.id!, payload)
//       : this.employeeService.create(payload);

//     const message = this.id ? 'Employee updated' : 'Employee created';

//     request$.pipe(first()).subscribe({
//       next: () => {
//         this.alertService.success(message, { keepAfterRouteChange: true });
//         this.router.navigateByUrl('/admin/employees');
//       },
//       error: (error: any) => {
//         this.alertService.error(error);
//         this.submitting = false;
//       }
//     });
//   }
// }


// file: employees/add-edit.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { first, forkJoin, Subscription } from 'rxjs';
import { PositionsService } from '@app/_services/position.service';
import { EmployeesService, AlertService, AccountService } from '@app/_services';

// ✅ Validator: hire date cannot exceed current year
function maxYearValidator(maxYear: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const year = new Date(control.value).getFullYear();
    return year > maxYear ? { maxYear: { value: control.value } } : null;
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
  currentYear = new Date().getFullYear();

  currentDepartment: string | null = null;
  currentPosition: string | null = null;

  accounts: any[] = [];
  departments: any[] = [];
  positions: any[] = [];
  routeSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeesService,
    private accountService: AccountService,
    private alertService: AlertService,
    private positionsService: PositionsService
  ) {}

  ngOnInit() {
    this.initForm();

    // Watch route params (create or edit)
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.title = this.id ? 'Edit Employee' : 'Create Employee';
      this.loadData();
    });
  }

  private loadData() {
    this.loading = true;

    // Load all needed data in parallel
    forkJoin({
      accounts: this.accountService.getAll().pipe(first()),
      departments: this.employeeService.getDepartments().pipe(first()),
      positions: this.positionsService.getEnabled().pipe(first()),
      employees: this.employeeService.getAll().pipe(first())
    }).subscribe({
      next: ({ accounts, departments, positions, employees }) => {
        this.accounts = accounts;
        this.departments = departments;
        this.positions = positions;

        if (this.id) {
          this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe(emp => {
              this.currentDepartment = emp.department ?? null;
              this.currentPosition = emp.position ?? null;

              this.filterPositions(employees, emp.employeeId);

              this.form.patchValue({
                employeeId: emp.employeeId,
                accountId: emp.accountId,
                position: emp.position,
                department: emp.department,
                hireDate: emp.hireDate,
                status: emp.status ?? 'Active'
              });

              this.loading = false;
            });
        } else {
          this.filterPositions(employees);
          this.employeeService.getNextId()
            .pipe(first())
            .subscribe(res => this.form.get('employeeId')?.setValue(res.nextId));
          this.loading = false;
        }
      },
      error: err => {
        console.error('Error loading form data', err);
        this.loading = false;
      }
    });
  }

  // ✅ Disable Manager/Head if already taken
  private filterPositions(employees: any[], currentEmpId?: string) {
    const usedPositions = employees
      .filter(e => e.employeeId !== currentEmpId)
      .map(e => e.position?.toLowerCase());

    this.positions = this.positions.map(pos => {
      const posName = pos.name.toLowerCase();
      const isManagerOrHead = posName.includes('manager') || posName.includes('head');

      return {
        ...pos,
        disabled:
          isManagerOrHead &&
          usedPositions.includes(posName) &&
          pos.name !== this.currentPosition
      };
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();
    if (this.form.invalid) return;

    this.submitting = true;
    const payload = { ...this.form.getRawValue() };

    const request$ = this.id
      ? this.employeeService.update(this.id!, payload)
      : this.employeeService.create(payload);

    const message = this.id ? 'Employee updated' : 'Employee created';

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        this.router.navigateByUrl('/admin/employees');
      },
      error: err => {
        this.alertService.error(err);
        this.submitting = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  private initForm() {
    this.form = this.fb.group({
      employeeId: [''],
      accountId: ['', Validators.required],
      position: ['', Validators.required],
      department: ['', Validators.required],
      hireDate: ['', [Validators.required, maxYearValidator(this.currentYear)]],
      status: ['', Validators.required]
    });
  }
}
