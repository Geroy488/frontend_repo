import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';
import { AccountService } from '@app/_services/account.service';

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html'
})
export class RequestsListComponent implements OnInit {
  requests: any[] = [];
  loading = true;

  constructor(
    private requestsService: RequestsService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    const currentUser = this.accountService.accountValue;
    if (!currentUser) return;

    // Admin sees all
    if (currentUser.role === 'Admin') {
      this.requestsService.getAll()
        .pipe(first())
        .subscribe({
          next: data => this.requests = data,
          complete: () => this.loading = false
        });
    } else {
      // Regular user sees own requests
      const empId = currentUser.employeeId;
      if (!empId) {
        console.warn('No employeeId found for user:', currentUser);
        this.loading = false;
        return;
    }

    this.requestsService.getByEmployeeId(empId)
      .pipe(first())
      .subscribe({
        next: data => this.requests = data,
        complete: () => this.loading = false
      });
    }
  }
}
