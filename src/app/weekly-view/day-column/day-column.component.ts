import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { DishType, IDish } from '../../shared/interfaces/dish';
import { IKeyValuePair } from '../../shared/interfaces/key-value-pair';
import { groupBy, find, isNil } from 'lodash';
import { DishesService } from '../../management/services/dishes.service';

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

  private orderedIds = [];

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
  }

  constructor(private dishesService: DishesService) { }

  ngOnInit() {
  }

  async onDishSelect(categoryId: number, dish: IDish) {
    if (categoryId === DishType.special) {
      // Unselect main and garnish if special selected
      this.orderedItems[DishType.main] = null;
      this.orderedItems[DishType.garnish] = null;
      return;
    }

    if ((categoryId === DishType.main) || (categoryId === DishType.garnish)) {
      // Unselect special dish if main dish or garnish selected
      this.orderedItems[DishType.special] = null;
    }

    // console.log(`Selected ${this.dishesService.getDishCategory(categoryId)} "${dish.label}"`);
    // console.log(this.orderedItems[categoryId], dish.id);
  }

}
