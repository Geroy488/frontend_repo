import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowsService } from '@app/_services/workflows.service';
import { RequestsService } from '@app/_services/requests.service';

@Component({
  selector: 'app-workflow-add-edit',
  templateUrl: './add-edit.component.html'
})

export class WorkflowAddEditComponent implements OnInit {
  form!: FormGroup;
  id?: string;
  employeeId!: string;
  title!: string;
  loading = false;
  submitting = false;
  requests: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workflowsService: WorkflowsService,
    private requestsService: RequestsService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    this.employeeId = this.route.snapshot.paramMap.get('employeeId')!;

    this.form = this.fb.group({
      type: ['', Validators.required],
      items: ['', Validators.required],
      status: ['Pending', Validators.required],
      requestId: [null]
    });

    this.title = this.id ? 'Edit Workflow' : 'Add Workflow';

    // Load available requests for dropdown
    this.requestsService.getAll().subscribe({
      next: (res) => (this.requests = res),
      error: (err) => console.error('Error loading requests', err)
    });

    if (this.id) {
      this.loading = true;
      this.workflowsService.getById(+this.id) .subscribe({
        next: (wf) => {
          this.form.patchValue(wf);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading workflow', err);
          this.loading = false;
        }
      });
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting = true;

    const workflowData = {
      ...this.form.value,
      employeeId: this.employeeId
    };

    const request$ = this.id
      ? this.workflowsService.update(+this.id, workflowData)
      : this.workflowsService.create(workflowData);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/admin/workflows', this.employeeId]);
      },
      error: (err) => {
        console.error('Error saving workflow', err);
        this.submitting = false;
      }
    });
  }
}
