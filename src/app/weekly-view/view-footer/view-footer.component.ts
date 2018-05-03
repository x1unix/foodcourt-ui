import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { isString } from 'lodash';

@Component({
  selector: 'app-view-footer',
  templateUrl: './view-footer.component.html',
  styleUrls: ['./view-footer.component.scss']
})
export class ViewFooterComponent implements OnInit {

  @Input() visible = true;

  @Input() showSaveButton = false;

  @Input() busy = false;

  @Input() errorMessage = '';

  @Input() showError = false;

  @Output() save = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
