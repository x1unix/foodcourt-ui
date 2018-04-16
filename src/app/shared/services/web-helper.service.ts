import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {isNil, isObject, isString} from 'lodash';
import {IMessage} from '../interfaces/message';
import { environment } from '../../../environments/environment';

const ERR_DEFAULT = 'failed to perform request to API service';
const HOST = environment['host'] ? environment['host'] : `//${document.location.host}`;

@Injectable()
export class WebHelperService {

  constructor() { }

  /**
   * Adds API host to the relative URL.
   * Necessary for cases where API hosted on external resource.
   * @param url relative URL
   */
  patchUrlString(url: string) {
    return `${HOST}${url}`;
  }

  /**
   * extract response error
   * @param {HttpErrorResponse} err
   * @returns {string}
   */
  extractResponseError(err: HttpErrorResponse): string {
    if (isString(err.error)) {
      return err.error;
    }

    if (isObject(err.error)) {
      const msg: IMessage = <IMessage> err.error;
      return `${msg.msg || err.message}`;
    }

    return `${err.message} (${err.status} ${err.statusText || ERR_DEFAULT})`;
  }

}
