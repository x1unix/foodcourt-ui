import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators, FormArray, FormArrayName} from '@angular/forms';
import { isArray } from 'lodash';
import {LoadStatusComponent, ResourceStatus} from '../../shared/helpers';
import {SettingsService} from './settings.service';
import {WebHelperService} from '../../shared/services';
import {ISettings} from './interfaces/settings';

/*tslint:disable-next-line:max-line-length */
const HOST_IP_PATTERN = '^[A-Za-z0-9-\.]+$';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [SettingsService]
})
export class SettingsComponent extends LoadStatusComponent implements OnInit {

  saveStatus = new ResourceStatus();

  settings: FormGroup = null;

  constructor(
    private settingsService: SettingsService,
    private helper: WebHelperService) {
    super();
  }

  get recipients(): FormArray {
    return this.settings.get('sender').get('orderRecipients') as FormArray;
  }

  get hostPattern() {
    return HOST_IP_PATTERN;
  }

  ngOnInit() {
    this.getSettings();
  }

  getSettings() {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe(
      (data: ISettings) => {
        try {
          this.buildForm(data);
          this.isLoaded = true;
        } catch (ex) {
          this.error = `Failed to build form from response: ${ex.name} - ${ex.message}`;
          this.isFailed = true;
        }
      }, (error) => {
        this.error = this.helper.extractResponseError(error);
        this.isFailed = true;
      }
    );
  }

  private buildForm(settings: ISettings) {
    this.settings = new FormGroup({
      baseUrl: new FormControl(settings.baseUrl, Validators.compose([Validators.required])),
      smtp: new FormGroup({
        host: new FormControl(settings.smtp.host, Validators.required),
        port: new FormControl(settings.smtp.port, Validators.required),
        username: new FormControl(settings.smtp.username, Validators.required),
        password: new FormControl(settings.smtp.password, Validators.required)
      }),
      sender: new FormGroup({
        enable: new FormControl(settings.sender.enable, Validators.required),
        email: new FormControl(settings.sender.email, Validators.compose([Validators.required, Validators.email])),
        orderRecipients: new FormArray(this.getRecipientsList(settings))
      })
    });
  }

  private getRecipientsList(settings: ISettings): FormControl[] {
    if (isArray(settings.sender.orderRecipients)) {
      return settings.sender.orderRecipients.map((i: string) => {
        return new FormControl(i, Validators.compose([Validators.required, Validators.email]));
      });
    } else {
      return [
        new FormControl('', Validators.compose([Validators.required, Validators.email]))
      ];
    }
  }

  addRecipient() {
    this.recipients.push(new FormControl('', Validators.compose([Validators.required, Validators.email])));
  }

  isInvalid(fieldName: string): boolean {
    let field: any = this.settings;
    fieldName.split('.').forEach((i) => field = field.get(i));
    return field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.settings.dirty && this.settings.valid) {
      this.settings.disable({onlySelf: false, emitEvent: false});
      const data = <ISettings> this.settings.value;

      this.saveStatus.isLoading = true;

      this.settingsService.saveSettings(data).subscribe(
        () => {
          this.saveStatus.isLoaded = true;
          this.settings.enable({onlySelf: false, emitEvent: false});

          setTimeout(() => {
            this.saveStatus.isIdle = true;
          }, 5000);
        }, (error) => {
          this.saveStatus.error = this.helper.extractResponseError(error);
          this.saveStatus.isFailed = true;
          this.settings.enable({onlySelf: false, emitEvent: false});
        }
      );

      return false;
    }

  }

}
