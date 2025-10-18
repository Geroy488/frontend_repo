// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
// import { first } from 'rxjs/operators';
// import { Subscription } from 'rxjs';

// import { RequestsService, EmployeesService, AlertService } from '@app/_services';

// @Component({
//   selector: 'app-request-add-edit',
//   templateUrl: './add-edit.component.html'
// })
// export class RequestAddEditComponent implements OnInit, OnDestroy {
//   form!: FormGroup;
//   id?: string;
//   title!: string;
//   loading = false;
//   submitting = false;
//   submitted = false;
//   private routeSub!: Subscription;

//   // Employees for dropdown
//   employees: any[] = [];

//   constructor(
//     private formBuilder: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private requestsService: RequestsService,
//     private employeesService: EmployeesService,
//     private alertService: AlertService
//   ) {}

//   ngOnInit() {
//     this.loadEmployees();

//     this.routeSub = this.route.params.subscribe(params => {
//       this.id = params['id'];
//       this.initForm();
//       this.title = this.id ? 'Edit Request' : 'Create Request';

//       if (this.id) {
//       this.loading = true;
//       this.requestsService.getById(+this.id)
//         .pipe(first())
//         .subscribe({
//           next: (x: any) => {
//             // Reset items FormArray
//             this.items.clear();

//             // Parse items string -> array
//             if (x.items) {
//               const parts = x.items.split(',').map((s: string) => s.trim());
//               parts.forEach((p: string) => {
//                 // Match "Name (Qty)"
//                 const match = p.match(/^(.*)\((\d+)\)$/);
//                 if (match) {
//                   this.items.push(this.formBuilder.group({
//                     name: [match[1].trim(), Validators.required],
//                     quantity: [parseInt(match[2], 10), [Validators.required, Validators.min(1)]]
//                   }));
//                 }
//              });
//            }

//             // If no items parsed, at least keep one blank row
//             if (this.items.length === 0) this.addItem();

//             // Patch other fields
//             this.form.patchValue({
//               type: x.type,
//               employeeId: x.employeeId,
//               status: x.status ?? 'Pending'
//             });

//                this.loading = false;
//           },
//               error: () => this.loading = false
//         });
//       }
//     });
//   }

//   ngOnDestroy() {
//     if (this.routeSub) this.routeSub.unsubscribe();
//   }

//   private loadEmployees() {
//     this.loading = true;
//     this.employeesService.getAllEmployees()
//       .pipe(first())
//       .subscribe({
//         next: (data: any[]) => {
//           this.employees = data;
//           this.loading = false;
//         },
//         error: (err: any) => {
//           console.error('Error loading employees', err);
//           this.loading = false;
//         }
//       });
//   }

//     private initForm() {
//     this.submitted = false;
//     this.submitting = false;
//     this.loading = false;

//     this.form = this.formBuilder.group({
//       type: ['', Validators.required],
//       employeeId: ['', Validators.required],
//       items: this.formBuilder.array([]),
//       status: ['Pending', Validators.required]
//     });

//     // ✅ Add one blank item row by default
//     this.addItem();
//   }

//   get f() { return this.form.controls; }
//   get items(): FormArray {
//     return this.form.get('items') as FormArray;
//   }

//   addItem() {
//     const itemForm = this.formBuilder.group({
//       name: ['', Validators.required],
//       quantity: [1, [Validators.required, Validators.min(1)]]
//     });
//     this.items.push(itemForm);
//   }

//     removeItem(index: number) {
//     this.items.removeAt(index);
//     }

//   onSubmit() {
//     this.submitted = true;
//     this.alertService.clear();

//     if (this.form.invalid) return;

//     this.submitting = true;
//     const payload = { ...this.form.value };

    
//     // ✅ Convert FormArray -> string
//     if (Array.isArray(payload.items)) {
//     payload.items = payload.items
//     .map((x: any) => `${x.name} (${x.quantity})`)
//     .join(', ');
//     }

//     let request$;
//     let message: string;

//     if (this.id) {
//       payload.createdByRole = 'Admin';   // 👈 add this line
//       request$ = this.requestsService.update(+this.id, payload);
//       message = 'Request updated';
//     } else {
//       payload.createdByRole = 'Admin';  // 👈 ADD THIS LINE
//       request$ = this.requestsService.create(payload);
//       message = 'Request created';
//     }


//     request$.pipe(first()).subscribe({
//       next: () => {
//         this.alertService.success(message, { keepAfterRouteChange: true });
//         this.router.navigateByUrl('/admin/requests');
//       },
//        error: (error: any) => {
//       this.alertService.error(error?.message || 'Failed to save request');
//       this.submitting = false;
//       }
//     });
//   }
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { RequestsService, EmployeesService, AlertService } from '@app/_services';

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
  submitToAdmin = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    private employeesService: EmployeesService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadEmployees();
    this.loadApprovers();

    // If editing an existing request
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
                employeeId: x.employeeId,
                approverId: x.approverId,
                type: x.type,
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
      status: ['Pending']
    });
    this.addItem();
  }

  private loadEmployees() {
    this.employeesService.getAllEmployees()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => this.employees = data,
        error: err => console.error('Error loading employees', err)
      });
  }

  private loadApprovers() {
    this.employeesService.getAllEmployees()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.approvers = data.filter(emp => emp.account?.role === 'Manager' || emp.account?.role === 'Head');
          if (this.approvers.length === 0) this.approvers = data;
        },
        error: err => console.error('Error loading approvers', err)
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

    // Convert FormArray → string
    if (Array.isArray(payload.items)) {
      payload.items = payload.items
        .map((x: any) => `${x.name} (${x.quantity})`)
        .join(', ');
    }

    // Default status logic (Draft or Pending)
    payload.status = this.submitToAdmin ? 'Pending' : 'Draft';
    payload.createdByRole = 'Admin';

    let request$;
    let message: string;

    if (this.id) {
      request$ = this.requestsService.update(+this.id, payload);
      message = this.submitToAdmin ? 'Request submitted' : 'Request saved';
    } else {
      request$ = this.requestsService.create(payload);
      message = this.submitToAdmin ? 'Request submitted' : 'Request saved';
    }

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        this.router.navigateByUrl('/admin/requests');
      },
      error: (error: any) => {
        this.alertService.error(error?.message || 'Failed to save request');
        this.submitting = false;
      }
    });
  }
}
