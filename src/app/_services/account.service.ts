    import { Injectable } from '@angular/core';
    import { Router } from '@angular/router';
    import { HttpClient } from '@angular/common/http';
    import { BehaviorSubject, Observable } from 'rxjs';
    import { map, catchError } from 'rxjs/operators';

    import { environment } from '@environments/environment';
    import { Account } from '@app/_models';

    const baseUrl = `${environment.apiUrl}/accounts`;

    @Injectable({ providedIn: 'root' })
    export class AccountService {
        private accountSubject: BehaviorSubject<Account | null>;
        public account: Observable<Account | null>;
        private refreshTokenTimeout?: any;

        constructor(private router: Router, private http: HttpClient) {
            this.accountSubject = new BehaviorSubject<Account | null>(null);
            this.account = this.accountSubject.asObservable();
        }

        // Current logged-in account
        public get accountValue() {
            return this.accountSubject.value;
        }

        // LOGIN
        login(email: string, password: string) {
            return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
                .pipe(
                    map(account => {
                        this.accountSubject.next(account);
                        this.startRefreshTokenTimer();
                        return account;
                    }),
                    catchError(err => { throw err; })
                );
        }

        // LOGOUT
        logout() {
            this.http.post(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
            this.stopRefreshTokenTimer();
            this.accountSubject.next(null);
            this.router.navigate(['/account/login']);
        }

        // REFRESH TOKEN
        refreshToken() {
            return this.http.post<Account>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
                .pipe(map(account => {
                    this.accountSubject.next(account);
                    this.startRefreshTokenTimer();
                    return account;
                }));
        }

            // CREATE ACCOUNT (Admin Dashboard)
        create(account: Account) {
            // use /accounts instead of /register to respect status field
            return this.http.post<Account>(`${baseUrl}`, account)
                .pipe(
                    map(newAccount => newAccount),
                    catchError(err => { throw err; })
                );
        }


       // REGISTER
        register(account: Account) {
        return this.http.post<Account>(`${environment.apiUrl}/accounts/register`, account)
        .pipe(
            map(newAccount => newAccount),
            catchError(err => { throw err; })
        );
}

        // VERIFY EMAIL
        verifyEmail(token: string) {
            return this.http.post(`${baseUrl}/verify-email`, { token });
        }

        // FORGOT PASSWORD
        forgotPassword(email: string) {
            return this.http.post(`${baseUrl}/forgot-password`, { email });
        }

        // VALIDATE RESET TOKEN
        validateResetToken(token: string) {
            return this.http.post(`${baseUrl}/validate-reset-token`, { token });
        }

        // RESET PASSWORD
        resetPassword(token: string, password: string, confirmPassword?: string) {
            return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
        }

        // GET ALL ACCOUNTS
        getAll() {
            return this.http.get<Account[]>(baseUrl);
        }

        // GET ACCOUNT BY ID
        getById(id: string) {
            return this.http.get<Account>(`${baseUrl}/${id}`);
        }

        // UPDATE ACCOUNT
        update(id: string, params: any) {
            return this.http.put<Account>(`${baseUrl}/${id}`, params)
                .pipe(map(account => {
                    if (account.id === this.accountValue?.id) {
                        const updated = { ...this.accountValue, ...account };
                        this.accountSubject.next(updated);
                    }
                    return account;
                }));
        }

        // DEACTIVATE ACCOUNT
        deactivate(id: string) {
            return this.http.delete(`${baseUrl}/${id}`)
                .pipe(map(() => {
                    if (this.accountValue?.id === id) this.accountSubject.next(null);
                    return id;
                }));
        }

        // --------------------------
        // HELPER METHODS FOR JWT
        // --------------------------
        private startRefreshTokenTimer() {
            const jwtBase64 = this.accountValue?.jwtToken?.split('.')[1];
            if (!jwtBase64) return;

            const jwtToken = JSON.parse(atob(jwtBase64));
            const expires = new Date(jwtToken.exp * 1000);
            const timeout = expires.getTime() - Date.now() - 60 * 1000;

            this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
        }

        private stopRefreshTokenTimer() {
            clearTimeout(this.refreshTokenTimeout);
        }
    }
