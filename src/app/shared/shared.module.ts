import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { ToastyModule } from 'ng2-toasty';
import { RouterModule } from '@angular/router';
import { NgSlimScrollModule } from 'ngx-slimscroll';

import {
  NotificationsService,
  LocalStorageService,
  EnvironmentService,
  LoggerService,
  SessionsService,
  AuthService,
  WebHelperService,
  MenuService,
  OrdersService,
  UsersService
} from './services';

import { TokenInterceptor } from './interceptors/token.interceptor';
import { LoggedInGuard } from './guards/logged-in.guard';
import { AdminGuard } from './guards/admin.guard';
import { FoodCardComponent } from './components/food-card/food-card.component';
import { RatingComponent } from './components/rating/rating.component';
import { RetryAlertComponent } from './components/retry-alert/retry-alert.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { HeaderToolbarComponent } from './components/header-toolbar/header-toolbar.component';
import { AlertComponent } from './components/alert/alert.component';
import { PosterComponent } from './components/poster/poster.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { NotificationComponent } from './components/notification/notification.component';
import { PopoverComponent } from './components/popover/popover.component';
import { PopoverTriggerDirective } from './directives/popover-trigger.directive';
import { FoodInfoComponent } from './components/food-info/food-info.component';


/**
 * Module provides access to common app parts and services
 *
 * @export
 * @class SharedModule
 */
@NgModule({
  imports: [
    ToastyModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule,
    ClarityModule,
    RouterModule,
    FormsModule,
    NgSlimScrollModule
  ],
  declarations: [
    FoodCardComponent,
    RatingComponent,
    RetryAlertComponent,
    SpinnerComponent,
    HeaderToolbarComponent,
    AlertComponent,
    PosterComponent,
    DatepickerComponent,
    NotificationComponent,
    PopoverComponent,
    PopoverTriggerDirective,
    FoodInfoComponent
  ],
  providers: [
    NotificationsService,
    LocalStorageService,
    EnvironmentService,
    LoggerService,
    SessionsService,
    LoggedInGuard,
    AdminGuard,
    AuthService,
    MenuService,
    WebHelperService,
    OrdersService,
    UsersService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    NotificationComponent,
    FoodCardComponent,
    RetryAlertComponent,
    RatingComponent,
    SpinnerComponent,
    HeaderToolbarComponent,
    AlertComponent,
    PosterComponent,
    DatepickerComponent,
    NgSlimScrollModule,
    PopoverComponent,
    PopoverTriggerDirective,
    FoodInfoComponent
  ]
})
export class SharedModule { }
