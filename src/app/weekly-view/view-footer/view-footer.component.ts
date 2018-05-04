import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { isString } from 'lodash';
import { NavigationDirection } from './navigation-direction';

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

  @Output() navigate = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  forward() {
    this.navigate.emit(NavigationDirection.Forward);
  }

  backward() {
    this.navigate.emit(NavigationDirection.Backward);
  }
}
