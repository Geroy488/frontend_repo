// import { Component, OnInit } from '@angular/core';
// import { first } from 'rxjs/operators';
// import { RequestsService } from '@app/_services/requests.service';

// @Component({
//   selector: 'app-requests-list',
//   templateUrl: './list.component.html'
// })
// export class RequestsListComponent implements OnInit {
//   adminRequests: any[] = [];
//   userRequests: any[] = [];
//   loading = true;

//   constructor(private requestsService: RequestsService) {}

//   ngOnInit() {
//   this.requestsService.getAll()
//     .pipe(first())
//     .subscribe({
//       next: (data: any[]) => {
//         // ✅ Admin created requests
//         this.adminRequests = data.filter(r => r.createdByRole === 'Admin');

//         // ✅ All user-created requests (Pending, Approved, Rejected)
//         this.userRequests = data.filter(r => r.createdByRole !== 'Admin');

//         // Optional: sort by status for neat display
//         this.userRequests.sort((a, b) => a.status.localeCompare(b.status));

//         this.loading = false;
//       },
//       error: (err) => {
//         console.error('Error loading requests:', err);
//         this.loading = false;
//       }
//     });
// }

// }


//for unified requests table

import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html'
})
export class RequestsListComponent implements OnInit {
  requests: any[] = [];  // 👈 Add this property
  loading = true;

  constructor(private requestsService: RequestsService) {}

  ngOnInit() {
    this.requestsService.getAll()
      .pipe(first())
      .subscribe({
        next: (data: any[]) => {
          this.requests = data;  // load all requests
          
          // Optional: sort by status (Pending, Approved, Rejected)
          this.requests.sort((a, b) => a.status.localeCompare(b.status));

          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading requests:', err);
          this.loading = false;
        }
      });
  }
}
