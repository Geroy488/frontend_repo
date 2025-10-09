import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';
import { AccountService } from '@app/_services/account.service';
import { EmployeesService } from '@app/_services/employee.service';

@Component({
  templateUrl: './add-edit.component.html'
})
export class RequestAddEditComponent implements OnInit {
  form!: FormGroup;
  id?: number;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;
  employees: any[] = [];
  currentUser: any;
  isAdmin = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    private accountService: AccountService,
    private employeesService: EmployeesService
  ) {}

  ngOnInit() {
    this.currentUser = this.accountService.accountValue;
    this.isAdmin = this.currentUser?.role === 'Admin';

    this.id = this.route.snapshot.params['id'];
    this.title = this.id ? 'Edit Request' : 'Create Request';

    this.form = this.formBuilder.group({
      type: ['', Validators.required],
      employeeId: [this.isAdmin ? '' : this.currentUser?.employeeId],
      items: this.formBuilder.array([])
    });

    if (this.isAdmin) {
      this.employeesService.getAll()
        .pipe(first())
        .subscribe(x => this.employees = x);
    }

    if (this.id) {
      this.loading = true;
      this.requestsService.getById(this.id)
        .pipe(first())
        .subscribe(x => {
          this.form.patchValue(x);
          this.loading = false;
        });
    }
  }

  get f() { return this.form.controls; }
  get items() { return this.form.get('items') as FormArray; }

  addItem() {
    this.items.push(this.formBuilder.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const requestData = {
      ...this.form.value,
      employeeId: this.isAdmin
        ? this.form.value.employeeId
        : this.currentUser.employeeId // 👈 auto-attach for non-admins
    };

    this.submitting = true;

    const save$ = this.id
      ? this.requestsService.update(this.id, requestData)
      : this.requestsService.create(requestData);

    save$.pipe(first()).subscribe({
      next: () => {
        alert('Request saved successfully');
        this.router.navigate(['/requests']);
      },
      error: err => {
        console.error(err);
        alert('Error saving request');
        this.submitting = false;
      }
    });
  }
}
