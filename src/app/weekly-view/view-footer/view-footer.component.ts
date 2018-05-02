import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-view-footer',
  templateUrl: './view-footer.component.html',
  styleUrls: ['./view-footer.component.scss']
})
export class ViewFooterComponent implements OnInit {

  @Input() visible = true;

  @Input() busy = false;

  @Output() save = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
