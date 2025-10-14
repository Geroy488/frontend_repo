// import { Component } from '@angular/core';
// import { AccountService } from '@app/_services'; 
// @Component({ templateUrl: 'home.component.html' }) 
// export class HomeComponent { 
//  account = this.accountService.accountValue; 

//  constructor(private accountService: AccountService) { } 
// }

import { Component } from '@angular/core';
import { AccountService } from '@app/_services'; 

@Component({ templateUrl: 'home.component.html' }) 
export class HomeComponent { 
    account: any;

 constructor(private accountService: AccountService) { } 

 ngOnInit() {
  this.accountService.account.subscribe(a => this.account = a);
 }
}