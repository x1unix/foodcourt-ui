import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import { SessionsService, LoggerService, URL_LOGIN } from '../services';
import {Router} from '@angular/router';
import { environment } from '../../../environments/environment';

// Set default host API URL for requests.
const HOST = environment['host'] ? environment['host'] : `//${document.location.host}`;

const WHITELIST = [
  URL_LOGIN
];

/**
 * Interceptor handles token and response routine for API communication
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: SessionsService, private log: LoggerService, private router: Router) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Check if necessary to add token
    const addToken = (!WHITELIST.includes(request.url)) || this.auth.isAuthorized;

    const changes: any = {};

    if (addToken) {
      changes.setParams = {
        'token': this.auth.token
      };
    }

    if (request.url.startsWith('/')) {
      changes.url = HOST + request.url;
    }

    request = request.clone(changes);

    // Handle HTTP errors
    return next.handle(request)
      .map((event: HttpEvent<any>) => event)
      .catch((err: any, caught) => {
        if (err instanceof HttpErrorResponse) {

          // Emit event if session is expired
          if ((err.status === 403) || (err.status === 401) && !WHITELIST.includes(request.url)) {
            this.log.warn('HTTP', 'Session expired');
            this.auth.purgeSession(true);
            this.router.navigate(['/auth']);
          }

          return Observable.throw(err);
        }
      });
  }
}
