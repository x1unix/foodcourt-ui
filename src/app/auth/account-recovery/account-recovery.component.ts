import { Component, OnInit } from '@angular/core';
import { LoadStatusComponent } from '../../shared/helpers';
import { FormGroup } from '@angular/forms';

enum RecoverySteps {
  CodeRequest,
  CodeSubmit,
  PasswordSubmit,
  Finish
}


@Component({
  selector: 'app-account-recovery',
  templateUrl: './account-recovery.component.html',
  styleUrls: ['./account-recovery.component.scss']
})
export class AccountRecoveryComponent extends LoadStatusComponent implements OnInit {

  currentStep: RecoverySteps = RecoverySteps.CodeRequest;

  hint = '';

  /**
   * Account recovery form state
   */
  state = {
    email: '',
    code: '',
    password: ''
  };

  get recoverySteps() {
    return RecoverySteps;
  }

  get formInvalid() {
    return false;
  }

  constructor() {
    super();
  }

  ngOnInit() {
    this.currentStep = RecoverySteps.CodeRequest;
    this.hint = 'Enter your email to reset your password';
  }

  isStep(step: RecoverySteps) {
    return this.currentStep === step;
  }

  onSubmit(event: Event) {
    switch (this.currentStep) {
      case RecoverySteps.CodeRequest:
        this.onCodeRequire();
        break;
      case RecoverySteps.CodeSubmit:
        this.onCodeSubmit();
        break;
      case RecoverySteps.PasswordSubmit:
        this.onFinish();
        break;
      default:
        break;
    }
    return false;
  }

  private onCodeRequire() {
    this.currentStep = RecoverySteps.CodeSubmit;
    const emailHidden = this.state.email.split('@').map((val, idx) => {
      if (idx === 0) {
        return Array.from(val).map((s, i) => i > 2 ? '*' : s).join('');
      }
      return val;
    }).join('@');

    this.hint = `We've sent you a code to ${emailHidden}, please enter it below to reset your password.`;
  }

  private onCodeSubmit() {
    this.currentStep = RecoverySteps.PasswordSubmit;
    this.hint = 'Enter the new password for your account';
  }

  private onFinish() {
    this.currentStep = RecoverySteps.Finish;
    this.hint = 'Your password has been changed. Now you can login with the new password to your account.';
  }



}
