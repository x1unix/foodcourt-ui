import { Component, OnInit } from '@angular/core';
import { LoadStatusComponent } from '../../shared/helpers';
import { FormGroup } from '@angular/forms';
import { PasswordRecoveryService } from '../services/password-recovery.service';
import { Router } from '@angular/router';

enum RecoverySteps {
  CodeRequest,
  CodeSubmit,
  PasswordSubmit,
  Finish
}


@Component({
  selector: 'app-account-recovery',
  templateUrl: './account-recovery.component.html',
  styleUrls: ['./account-recovery.component.scss'],
  providers: [PasswordRecoveryService]
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
    password: '',
    token: ''
  };

  get recoverySteps() {
    return RecoverySteps;
  }

  get formInvalid() {
    return false;
  }

  constructor(private recovery: PasswordRecoveryService, private router: Router) {
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
    event.preventDefault();
    this.handleAction();
    return false;
  }

  private async handleAction() {
    this.isLoading = true;
    try {
      switch (this.currentStep) {
        case RecoverySteps.CodeRequest:
          await this.onCodeRequire();
          break;
        case RecoverySteps.CodeSubmit:
          await this.onCodeSubmit();
          break;
        case RecoverySteps.PasswordSubmit:
          await this.onPasswordSubmit();
          break;
        default:
          this.router.navigate(['/auth']);
          break;
      }

      this.isLoaded = true;

    } catch (ex) {
      this.error = ex.message;
      this.isFailed = true;
    }
  }

  private async onCodeRequire() {
    await this.recovery.requireResetCode(this.state.email);

    this.currentStep = RecoverySteps.CodeSubmit;
    const emailHidden = this.state.email.split('@').map((val, idx) => {
      if (idx === 0) {
        return Array.from(val).map((s, i) => i > 2 ? '*' : s).join('');
      }
      return val;
    }).join('@');

    this.hint = `We've sent you a code to ${emailHidden}, please enter it below to reset your password.`;
  }

  private async onCodeSubmit() {
    const { email, code } = this.state;
    this.state.token = await this.recovery.submitCode(email, code);

    this.currentStep = RecoverySteps.PasswordSubmit;
    this.hint = 'Enter the new password for your account';
  }

  private async onPasswordSubmit() {
    await this.recovery.resetPassword(this.state.password, this.state.token);

    this.currentStep = RecoverySteps.Finish;
    this.hint = 'Your password has been changed. Now you can login with the new password to your account.';
  }



}
