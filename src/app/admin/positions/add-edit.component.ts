import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { PositionsService } from '@app/_services/position.service';

@Component({
  selector: 'app-positions-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  form!: FormGroup;
  id?: string;
  title!: string;
  loading = false;
  submitting = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private positionsService: PositionsService
  ) {}

  ngOnInit() {
  this.id = this.route.snapshot.params['id'];
  this.title = this.id ? 'Edit Position' : 'Add Position';

  this.form = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    status: ['ENABLE', Validators.required]   // ✅ Add this line
  });

  if (this.id) {
    this.loading = true;
    this.positionsService.getById(this.id)
      .pipe(first())
      .subscribe({
        next: (x) => {
          this.form.patchValue(x); // ✅ will fill status too
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }
}

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.submitting = true;
    const saveRequest = this.id
      ? this.positionsService.update(this.id, this.form.value)
      : this.positionsService.create(this.form.value);

    saveRequest
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/admin/positions');
        },
        error: () => (this.submitting = false)
      });
  }
}
