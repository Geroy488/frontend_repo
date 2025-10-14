// file: employees/add-edit.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PositionsService } from '@app/_services/position.service';
import { EmployeesService, AlertService, AccountService } from '@app/_services';

// Custom validator: hireDate cannot be in a future year
function maxYearValidator(maxYear: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null; // allow empty, handled by required validator
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
  currentPosition: string | null = null;

  accounts: any[] = [];
  departments: any[] = [];
  positions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeesService,
    private accountService: AccountService,
    private alertService: AlertService,
    private positionsService: PositionsService
  ) {}

  ngOnInit() {
    this.initForm();

    // Load available accounts
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (accounts: any[]) => {
          this.employeeService.getAll()
            .pipe(first())
            .subscribe({
              next: (employees: any[]) => {
                const usedAccountIds = employees.map(e => e.accountId);
                if (this.id) {
                  this.employeeService.getById(this.id)
                    .pipe(first())
                    .subscribe(emp => {
                      const currentAccountId = emp.accountId;
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

    // Check if edit or create
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.title = this.id ? 'Edit Employee' : 'Create Employee';

      if (this.id) {
        // 🔹 EDIT MODE
        this.loading = true;
        this.employeeService.getById(this.id)
          .pipe(first())
          .subscribe({
            next: (emp: any) => {
              this.currentDepartment = emp.department;
              this.currentPosition = emp.position;

              // Load departments excluding current
              this.employeeService.getDepartments()
                .pipe(first())
                .subscribe({
                  next: (depts: any[]) => {
                    this.departments = depts.filter(d => d.name !== emp.department);
                  },
                  error: (err) => console.error('Error loading departments', err)
                });

              // Load positions — enabled ones + include current (even if disabled)
             this.positionsService.getAll()
              .pipe(first())
              .subscribe({
                next: (pos: any[]) => {
                  // Keep all ENABLE positions + include the current employee's position (even if DISABLE)
                  this.positions = pos.filter(p =>
                    p.status === 'ENABLE' || p.name === emp.position
                  );

                  // If current position is DISABLE, mark it for labeling later
                  const currentPos = pos.find(p => p.name === emp.position);
                  if (currentPos && currentPos.status === 'DISABLE') {
                    this.currentPosition = `${currentPos.name} (Disabled)`;
                  } else {
                    this.currentPosition = emp.position;
                  }

                  // Sort to put current position first
                  this.positions.sort((a, b) => {
                    if (a.name === emp.position) return -1;
                    if (b.name === emp.position) return 1;
                    return 0;
                  });
                },
                error: (err) => console.error('Error loading positions', err)
              });
              
              // Patch form
              this.form.patchValue({
                employeeId: emp.employeeId,
                accountId: emp.accountId,
                position: emp.position,
                department: emp.department,
                hireDate: emp.hireDate,
                status: emp.status ?? 'Active'
              });

              this.loading = false;
            },
            error: () => this.loading = false
          });

      } else {
        // 🔹 CREATE MODE
        this.employeeService.getDepartments()
          .pipe(first())
          .subscribe({
            next: (depts: any[]) => this.departments = depts,
            error: (err) => console.error('Error loading departments', err)
          });

        // Load only enabled positions
        this.positionsService.getEnabled()
          .pipe(first())
          .subscribe({
            next: (enabledPositions: any[]) => {
              this.positions = enabledPositions;
            },
            error: (err) => console.error('Error loading positions', err)
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

  // ✅ Helper method for HTML
  isCurrentPositionDisabled(): boolean {
    if (!this.positions || !this.currentPosition) return false;
    return !this.positions.some(pos => pos.name === this.currentPosition);
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
      error: (error: any) => {
        this.alertService.error(error);
        this.submitting = false;
      }
    });
  }
}
