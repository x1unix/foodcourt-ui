import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IDish } from '../../shared/interfaces/dish';

@Component({
  selector: 'app-dish-group',
  templateUrl: './dish-group.component.html',
  styleUrls: ['./dish-group.component.scss']
})
export class DishGroupComponent implements OnInit {

  /**
   * Dish group title
   */
  @Input() label: string;

  /**
   * Currently selected id
   */
  @Input() selectedId = 0;

  /**
   * List of dishes for group
   */
  @Input() dishes: IDish[];

  /**
   * Dish selection change event
   */
  @Output() pick = new EventEmitter<IDish>();

  constructor() { }

  ngOnInit() {
  }

  onItemSelect(item: IDish) {
    this.selectedId = item.id;
    this.pick.emit(item);
  }

}
