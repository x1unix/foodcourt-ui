import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';
import { DishType, IDish } from '../../shared/interfaces/dish';
import { IKeyValuePair } from '../../shared/interfaces/key-value-pair';
import { groupBy, find, isNil, compact } from 'lodash';
import { DishesService } from '../../management/services/dishes.service';
import { DayColumnEvent } from './day-column-event';

/**
 * A column with daily menu for one day.
 *
 * @example <app-day-column date="20180512"> ... </app-day-column>
 */
@Component({
  selector: 'app-day-column',
  templateUrl: './day-column.component.html',
  styleUrls: ['./day-column.component.scss']
})
export class DayColumnComponent implements OnInit {

  dayOfMonth: number;

  dayOfWeek: string;

  month: string;

  groups: IKeyValuePair<number, IDish[]>[] = [];

  hasDishes = false;

  orderedItems: number[] = [];

  errorGroup = -1;

  private orderedIds = [];

  /**
   * Date in FC format (YYYYMMDD)
   */
  private fcDate: string;

  /**
   * Column values change event
   */
  @Output() change = new EventEmitter<DayColumnEvent>();

  /**
   * Is component disabled
   */
  @Input() disabled = false;

  /**
   * Highlight column's date
   */
  @Input() highlight = false;

  /**
   * Set list of dishes
   */
  @Input() set dishes(dishes: IDish[]) {
    this.hasDishes = dishes.length > 0;
    this.orderedItems = [];

    // Just clear array if no dishes present
    if (!this.hasDishes) {
      this.groups = [];
      return;
    }

    // Group dishes by type
    const grouped = groupBy(dishes, 'type');

    // Convert object map to key-value pair
    this.groups = Object.keys(grouped).map(k => ({
      key: +k,
      value: <IDish[]> grouped[k],
      tag: this.dishesService.getDishCategory(+k)
    }));
  }


  /**
   * Ordered dishes ids.
   */
  @Input() set orders(ids: number[]) {
    this.orderedItems.length = 0;

    // Match ordered ids to items in each category
    this.groups.forEach(group => {
      const found = find(group.value, (dish: IDish) => ids.includes(dish.id));
      if (!isNil(found)) {
        this.orderedItems[group.key] = found.id;
      }
    });

    this.orderedIds = ids;
  }

  get orders(): number[] {
    return this.orderedIds;
  }

  /**
   * Set date in format YYYYMMDD.
   */
  @Input() set date(fcDate: string) {
    const date = moment(fcDate, 'YYYYMMDD');

    if (!date.isValid()) {
      throw new ReferenceError(`invalid date format, excepted YYYYMMDD format, got '${fcDate}'`);
    }

    this.dayOfWeek = date.format('dddd');
    this.dayOfMonth = date.date();
    this.month = date.format('MMM');
    this.fcDate = fcDate;
  }

  constructor(private dishesService: DishesService) { }

  ngOnInit() {
  }

  async onDishSelect(categoryId: number, dish: IDish) {
    if (categoryId === DishType.special) {
      // Unselect main and garnish if special selected
      this.orderedItems[DishType.main] = null;
      this.orderedItems[DishType.garnish] = null;
    }

    if ((categoryId === DishType.main) || (categoryId === DishType.garnish)) {
      // Unselect special dish if main dish or garnish selected
      this.orderedItems[DishType.special] = null;
    }

    // Report form changes with a bit delay§
    let failed = false;
    let error = null;
    const items = compact(this.orderedItems);

    try {
      // Check if order form filled correctly
      this.checkOrderState();
    } catch (err) {
      // Add error information
      failed = true;
      error = err.message;
    } finally {
      // Emit change event
      this.change.emit({ failed, error, items });
    }
  }

  isCategoryInOrder(categoryId: number): boolean {
    return !isNil(this.orderedItems[categoryId]);
  }

  /**
   * Checks that order state is correct
   */
  checkOrderState() {
    // Reset error group
    this.errorGroup = -1;

    // Check if main is ordered but not the garnish
    if (this.isCategoryInOrder(DishType.main) && !this.isCategoryInOrder(DishType.garnish)) {
      this.errorGroup = DishType.garnish;
      throw new Error(`Please select garnish or special for ${this.dayOfMonth}th ${this.month}`);
    }

    // The same approach but vice-versa
    if (this.isCategoryInOrder(DishType.garnish) && !this.isCategoryInOrder(DishType.main)) {
      this.errorGroup = DishType.main;
      throw new Error(`Please select a main dish or special for ${this.dayOfMonth}th ${this.month}`);
    }
  }


  /**
   * Get ordered items
   */
  async getOrderSummary(): Promise<number[]> {
    return compact(this.orderedItems);

  }

}
