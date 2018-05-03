import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isString } from 'lodash';

@Component({
  selector: 'app-view-footer',
  templateUrl: './view-footer.component.html',
  styleUrls: ['./view-footer.component.scss']
})
export class ViewFooterComponent implements OnInit {

  @Input() visible = true;

  @Input() busy = false;

  @Input() errorMessage = '';

  @Output() save = new EventEmitter();

  get showError(): boolean {
    return isString(this.errorMessage) && (this.errorMessage.length > 0);
  }

  constructor() { }

  ngOnInit() {
  }

}
