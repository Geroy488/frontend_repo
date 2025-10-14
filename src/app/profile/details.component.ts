// import { Component } from '@angular/core';

// import { AccountService } from '@app/_services';

// @Component({ templateUrl: 'details.component.html' })
// export class DetailsComponent {
//     account = this.accountService.accountValue;

//     constructor(private accountService: AccountService) { }
// }


import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/_services';

@Component({ templateUrl: './details.component.html' })
export class DetailsComponent implements OnInit {
    account: any;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        this.account = this.accountService.accountValue;

        // Optional: subscribe to changes for reactivity
        this.accountService.account.subscribe(a => this.account = a);
    }
}
