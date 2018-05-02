import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { IDish } from '../../shared/interfaces/dish';
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

  orderedItems = new Map<number, number>();

  private orderedIds = [];

  @Input() set dishes(dishes: IDish[]) {
    this.hasDishes = dishes.length > 0;
    this.orderedItems = new Map<number, number>();

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
    this.orderedItems.clear();

    // Match ordered ids to items in each category
    this.groups.forEach(group => {
      const found = find(group.value, (dish: IDish) => ids.includes(dish.id));
      if (!isNil(found)) {
        this.orderedItems.set(group.key, found.id);
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

}
