import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;    
  private routeSub!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.initForm();
      this.title = this.id ? 'Edit Account' : 'Create Account';

      if (this.id) {
        // Editing existing account → load values
        this.loading = true;
        this.accountService.getById(this.id)
          .pipe(first())
          .subscribe({
            next: x => {
              this.form.patchValue({
                title: x.title,
                firstName: x.firstName,
                lastName: x.lastName,
                email: x.email,
                role: x.role,
                status: x.status // ✅ use exact value from backend
              });
              this.loading = false;
            },
            error: () => this.loading = false
          });
      } else {
        // Creating new → optionally set default (can be left blank if desired)
        this.form.patchValue({ status: 'Active' }); // or leave blank if you want admin to choose
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
      status: ['Active', Validators.required], // must send user selection
      password: ['', [
        Validators.minLength(6),
        ...(!this.id ? [Validators.required] : [])
      ]],
        confirmPassword:['']
    },
  {
    validator:MustMatch('password', 'confirmPassword')
  });
  }

  get f() { return this.form.controls; }

  onSubmit() {
  this.submitted = true;
  this.alertService.clear();
  if (this.form.invalid) return;

  this.submitting = true;

  const payload: any = { ...this.form.value };

  // 🔹 Remove password + confirmPassword if blank (edit case)
  if (!payload.password) {
    delete payload.password;
    delete payload.confirmPassword;
  }

  let request$;
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
    error: (error: any) => {
      this.alertService.error(error);
      this.submitting = false;
    }
  });
 }
}
