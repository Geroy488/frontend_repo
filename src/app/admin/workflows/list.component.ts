import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkflowsService } from '@app/_services/workflows.service';
import { Workflow } from '@app/_models/workflow';

@Component({ templateUrl: 'list.component.html' })
export class WorkflowListComponent implements OnInit {
  workflows: Workflow[] = [];
  employeeId!: string;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private workflowsService: WorkflowsService
  ) {}

  ngOnInit() {
  // just get the raw string from the route param
  this.employeeId = this.route.snapshot.paramMap.get('employeeId')!;
  this.loadWorkflows();
 }
  
  updateStatus(wf: Workflow) {
  this.workflowsService.update(wf.id, { status: wf.status })
    .subscribe({
      next: () => console.log('Workflow status updated'),
      error: err => console.error('Failed to update workflow', err)
    });
}

  loadWorkflows() {
    this.loading = true;
    this.workflowsService.getByEmployeeId(this.employeeId)
      .subscribe({
        next: (data) => {
          this.workflows = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load workflows:', err);
          this.loading = false;
        }
      });
  }
}

  
