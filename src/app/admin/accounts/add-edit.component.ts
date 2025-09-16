import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AccountService, AlertService } from '@app/_services';
//import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'add-edit.component.html' })
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
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // subscribe to route params so the component resets when id changes
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.initForm();

      this.title = this.id ? 'Edit Account' : 'Create Account';

      if (this.id) {
        this.loading = true;
        this.accountService.getById(this.id)
          .pipe(first())
          .subscribe({
            next: x => {
              // ensure backend returns "status" property; safe patch
              this.form.patchValue({
                title: x.title,
                firstName: x.firstName,
                lastName: x.lastName,
                email: x.email,
                role: x.role,
                status: x.status ?? 'Active'   // fallback
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
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      status: ['', Validators.required],            // <-- added status
      password: ['', [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])]],
     // confirmPassword: ['', Validators.required]
    }
     // validator: MustMatch('password', 'confirmPassword')
    );
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    const payload: any = { ...this.form.value };
    // remove confirmPassword before sending
    delete payload.confirmPassword;

    // don't send password if blank
    if (!payload.password) {
      delete payload.password;
    }

   let request$: any;       // or Observable<any> if you want stricter typing
   let message: string;
    if (this.id) {
      request$ = this.accountService.update(this.id!, payload);
      message = 'Account updated';
    } else {
      request$ = this.accountService.create(payload);
      message = 'Account created';
    }

    request$.pipe(first()).subscribe({
      next: () => {
        this.alertService.success(message, { keepAfterRouteChange: true });
        this.router.navigateByUrl('/admin/accounts');
      },
      error: (error : any) => {
        this.alertService.error(error);
        this.submitting = false;
      }
    });
  }
}
