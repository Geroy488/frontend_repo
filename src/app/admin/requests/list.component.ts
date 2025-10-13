import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html'
})
export class RequestsListComponent implements OnInit {
  adminRequests: any[] = [];
  userRequests: any[] = [];
  loading = true;

  constructor(private requestsService: RequestsService) {}

  ngOnInit() {
    this.requestsService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          // ✅ Split requests by account role
          this.adminRequests = data.filter(
            r => r.employee?.account?.role === 'Admin'
          );
          this.userRequests = data.filter(
            r => r.employee?.account?.role !== 'Admin'
          );

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading requests:', err);
          this.loading = false;
        }
      });
  }
}
