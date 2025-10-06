import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './_helpers/credentials.interceptor';
import { RouterModule } from '@angular/router';   // ✅ for routerLink
import { CommonModule } from '@angular/common';   // ✅ for ngClass, ngIf, ngFor

// used to create fake backend
//import { fakeBackendProvider } from './_helpers';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor, ErrorInterceptor, appInitializer } from './_helpers';
import { AccountService } from './_services';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home';


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,         // ✅ added
    HttpClientModule,
    RouterModule,        // ✅ added
    CommonModule,        // ✅ added
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CredentialsInterceptor, multi: true }
    //fakeBackendProvider   // ⚠️ if you still need fake backend
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
