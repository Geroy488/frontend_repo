import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Account } from '@app/_models';   // 👈 make sure you have this model
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
  accounts?: Account[];

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService
      .getAll()
      .pipe(first())
      .subscribe((accounts: Account[]) => (this.accounts = accounts));
  }

  deactivateAccount(id: string) {
    const account = this.accounts!.find((x) => x.id === id);
    if (!account) return;

    (account as any).isDeactivating = true;
    this.accountService
      .update(id, { status: 'Inactive' }) // 👈 call update with correct status
      .pipe(first())
      .subscribe(() => {
        (account as any).isDeactivating = false;
        account.status = 'Inactive';
      });
  }

  activateAccount(id: string) {
    const account = this.accounts!.find((x) => x.id === id);
    if (!account) return;

    (account as any).isActivating = true;
    this.accountService
      .update(id, { status: 'Active' })
      .pipe(first())
      .subscribe(() => {
        (account as any).isActivating = false;
        account.status = 'Active';
      });
  }
}
