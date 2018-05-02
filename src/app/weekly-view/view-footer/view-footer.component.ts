import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-view-footer',
  templateUrl: './view-footer.component.html',
  styleUrls: ['./view-footer.component.scss']
})
export class ViewFooterComponent implements OnInit {

  @Input() visible = true;

  constructor() { }

  ngOnInit() {
  }

}
