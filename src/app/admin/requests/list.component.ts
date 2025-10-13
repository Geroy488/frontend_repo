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
      .subscribe((data: any[]) => {
        // Split requests based on creator
        this.adminRequests = data.filter(r => r.createdByRole === 'Admin');
        this.userRequests = data.filter(r => r.createdByRole === 'User');
        this.loading = false;
      });
  }
}
