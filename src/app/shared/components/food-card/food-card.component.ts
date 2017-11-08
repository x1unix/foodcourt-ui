import {Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output} from '@angular/core';
import { isNil } from 'lodash';

export const NO_PHOTO_URL = '/assets/dish_no_image.jpg';

/**
 * Dish card component
 *
 * @example <app-food-card label="Pizza" description="..."></app-food-card>
 */
@Component({
  selector: 'app-food-card',
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FoodCardComponent implements OnInit {

  // Behavior props

  /**
   * Can element be selected
   * @type {boolean}
   */
  @Input() selectable = false;

  /**
   * Is element selected
   * @type {boolean}
   */
  @Input() selected = false;

  /**
   * Can element be rated
   * @type {boolean}
   */
  @Input() rateable = true;

  /**
   * Is element disabled
   * @type {boolean}
   */
  @Input() disabled = false;

  /**
   * Show edit button
   * @type {boolean}
   */
  @Input() editable = false;


  // State props

  /**
   * Image url
   * @type {string}
   */
  @Input() imageUrl = NO_PHOTO_URL;

  /**
   * Dish name
   * @type {string}
   */
  @Input() label = 'No Label';

  /**
   * Dish description
   * @type {string}
   */
  @Input() description = 'No description';

  /**
   * Dish rating
   * @type {number}
   */
  @Input() rating = 0;

  /**
   * Dish category
   * @type {string}
   */
  @Input() category = 'No category';

  /**
   * Category badge color
   * @type {string}
   */
  @Input() badgeColor = 'success';

  // Events

  /**
   * Ratings change event
   * @type {EventEmitter<number>}
   */
  @Output() ratingChange = new EventEmitter<number>();

  /**
   * Checked state change event
   * @type {EventEmitter<boolean>}
   */
  @Output() checkChange = new EventEmitter<boolean>();

  /**
   * Edit button press event
   * @type {EventEmitter<any>}
   */
  @Output() edit = new EventEmitter();


  constructor() { }

  ngOnInit() {
    if (isNil(this.imageUrl)) {
      this.imageUrl = NO_PHOTO_URL;
    }
  }

  toggleSelected() {
    this.selected = !this.selected;
    this.checkChange.emit(this.selected);
  }

}