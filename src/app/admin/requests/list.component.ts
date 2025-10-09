import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { RequestsService } from '@app/_services/requests.service';

@Component({
  selector: 'app-requests-list',
  templateUrl: './list.component.html'
})
export class RequestsListComponent implements OnInit {
  requests: any[] = [];

  constructor(private requestsService: RequestsService) {}

  loading = true;
  
  ngOnInit() {
    this.requestsService.getAll()
      .pipe(first())
      .subscribe((data: any[]) => {
        this.requests = data;
      });
  }
}
