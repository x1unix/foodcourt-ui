import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { PopoverDirection } from './pop-direction';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PopoverComponent implements OnInit {

  private popoverDirectionClass = PopoverDirection.left;

  get direction() {
    return this.popoverDirectionClass;
  }

  @Input() set direction(newDirection: string) {
    if (!PopoverDirection.hasOwnProperty(newDirection)) {
      throw new ReferenceError(`Unknown direction property value: "${newDirection}"`);
    }

    this.popoverDirectionClass = PopoverDirection[newDirection];
  }

  constructor() { }

  ngOnInit() {
  }

}
