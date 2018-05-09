import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WebHelperService } from '../../shared/services';

enum PasswordRecoveryActionType {
  GetCode      = 'REQUEST_CODE',
  SubmitCode   = 'SUBMIT_CODE',
  SetPassword  = 'RESET_PASSWD'
}

interface PasswordRecoveryAction {
  action: PasswordRecoveryActionType;
  data: {[key: string]: string};
}

@Injectable()
export class PasswordRecoveryService {

  constructor(private http: HttpClient, private helper: WebHelperService) { }

  /**
   * Perform recovery action
   * @param action Password recovery action
   */
  private query(action: PasswordRecoveryActionType, data: { [key: string]: string }) {
    return this.http.post('/auth/recovery', { action, data })
    .catch(err => this.helper.extractResponseError(err))
    .toPromise();
  }

  /**
   * Request password recovery code
   * @param email User email
   */
  requireResetCode(email: string): Promise<string> {
    return <Promise<string>> this.query(PasswordRecoveryActionType.GetCode, { email });
  }

  /**
   * Submit password recovery code, returns reset token
   * @param code Code
   */
  submitCode(code: string): Promise<string> {
    return <Promise<string>> this.query(PasswordRecoveryActionType.SubmitCode, { code });
  }

  /**
   *
   * @param newPassword
   * @param resetToken
   */
  resetPassword(newPassword: string, resetToken: string) {
    return this.query(PasswordRecoveryActionType.SetPassword, { newPassword, resetToken });
  }

}
