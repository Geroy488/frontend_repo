import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentsService, AlertService } from '@app/_services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  title = '';             // 👈 for HTML
  loading = false;        // 👈 for HTML
  submitting = false;     // 👈 for HTML
  submitted = false;      // 👈 for HTML
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentsService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.params['id']);
    this.isAddMode = !this.id;

    this.title = this.isAddMode ? 'Create Department' : 'Edit Department';

    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    if (!this.isAddMode) {
      this.loading = true;
      this.sub = this.departmentService.getById(this.id).subscribe(dept => {
        this.form.patchValue(dept);
        this.loading = false;
      });
    }
  }

  // 👇 getter for f.name, f.description in template
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.alertService.clear();

    if (this.form.invalid) return;

    this.submitting = true;

    if (this.isAddMode) {
      this.sub = this.departmentService.create(this.form.value).subscribe({
        next: () => {
          this.alertService.success('Department created');
          this.router.navigate(['../'], { relativeTo: this.route });
        },
        error: () => (this.submitting = false)
      });
    } else {
      this.sub = this.departmentService.update(this.id, this.form.value).subscribe({
        next: () => {
          this.alertService.success('Department updated');
          this.router.navigate(['../../'], { relativeTo: this.route });
        },
        error: () => (this.submitting = false)
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
