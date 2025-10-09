import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';
import { AccountService } from '@app/_services/account.service'; // ✅ import

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html'
})
export class RequestsListComponent implements OnInit {
  requests: any[] = [];
  loading = true;

  constructor(
    private requestsService: RequestsService,
    private accountService: AccountService // ✅ inject
  ) {}

  ngOnInit() {
        const currentUser = this.accountService.accountValue; // ✅ correct getter
        if (!currentUser) return; // ✅ stop if no user is logged in


    // If user is admin, get all requests
    if (currentUser?.role === 'Admin') {
      this.requestsService.getAll()
        .pipe(first())
        .subscribe((data: any[]) => {
          this.requests = data;
          this.loading = false;
        });
    } else {
      // ✅ Otherwise, only get requests created by this user's employeeId
      this.requestsService.getByEmployeeId(currentUser.employeeId!)
        .pipe(first())
        .subscribe((data: any[]) => {
          this.requests = data;
          this.loading = false;
        });
    }
  }
}
