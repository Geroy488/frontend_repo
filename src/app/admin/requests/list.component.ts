import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';
import { AccountService } from '@app/_services/account.service';
import { Account } from '@app/_models/account';
import { Employee } from '@app/_models/employee';

@Component({
  selector: 'app-requests-list',
  templateUrl: 'list.component.html'
})
export class ListComponent implements OnInit {
  requests: any[] = [];
  currentUser!: Account | null;

  constructor(
    private requestsService: RequestsService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.accountService.account.subscribe({
      next: user => {
        this.currentUser = user;
        if (user && user.employeeId) {
          // 👇 Show only their own requests
          this.loadRequests(user.employeeId);
        } else {
          console.warn('No employeeId found for current user');
        }
      }
    });
  }

  loadRequests(employeeId: number) {
    this.requestsService
      .getByEmployeeId(employeeId)
      .pipe(first())
      .subscribe({
        next: requests => (this.requests = requests),
        error: err => console.error('Error loading requests:', err)
      });
  }
}
