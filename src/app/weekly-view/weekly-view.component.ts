import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { isArray, isNil } from 'lodash';
import { LoadStatusComponent } from '../shared/helpers';
import { MenuService, WebHelperService, SessionsService, OrdersService } from '../shared/services';
import { IDish, MenuSet } from '../shared/interfaces/dish';
import { IKeyValuePair } from '../shared/interfaces/key-value-pair';
import { DayColumnEvent } from './day-column/day-column-event';


/**
 * Weekly view page
 */
@Component({
  selector: 'app-weekly-view',
  templateUrl: './weekly-view.component.html',
  styleUrls: ['./weekly-view.component.scss']
})
export class WeeklyViewComponent extends LoadStatusComponent implements OnInit {

  private readonly FC_DATE_FORMAT = 'YYYYMMDD';

  /**
   * Array of dates
   */
  dates = [];

  /**
   * Date to ids map
   */
  ordered: {string: number[]} = null;

  /**
   * Is form changed
   */
  dirty = false;

  /**
   * Order form errors
   */
  lastFormError: string = null;

  /**
   * Has order form an error
   */
  formHasError = false;

  /**
   * Selected start date
   */
  private startDate: moment.Moment;

  /**
   * Date and menu dictionary
   */
  private menus: MenuSet = null;

  private period: string[] = [];

  /**
   * Form errors
   */
  private formErrors = new Map<string, string>();


  /**
   * Set date for weekly viewer
   */
  set date(newDate: moment.Moment) {
    // Create a new date with week start.
    // isoWeek means that Monday is start day.
    const date = newDate.clone().startOf('isoWeek');

    // Clone the date and save it.
    this.startDate = date.clone();

    // Prepare list of days
    const datesList = [];

    // Iterate through each day and generate the list
    for (let i = 0, ii = 4; i <= ii; i++) {
      // Add one day and format to FoodCourt date format.
      // moment.add() operation is mutable, so it will modify
      // the date variable each time and return itself.
      datesList.push((i > 0 ? date.add(1, 'd') : date).format(this.FC_DATE_FORMAT));
    }

    this.period = [
      datesList[0],
      datesList[datesList.length - 1]
    ];

    this.dates = datesList;
  }

  constructor(
    private menu: MenuService,
    private orders: OrdersService,
    private session: SessionsService,
    private helper: WebHelperService
  ) {
    super();
  }

  ngOnInit() {
    this.date = moment();
    this.fetchData();
  }

  /**
   * Day order change event handler
   * @param date Date (YYYYMMDD)
   * @param ids List of new item ids
   */
  onOrderChange(date: string, event: DayColumnEvent) {
    // Mark form as dirty
    this.dirty = true;

    // Put result
    this.ordered[date] = event.items;

    if (event.failed) {
      // Put errors to the stack if have some
      this.formErrors.set(date, event.error);

      // Print error
      this.lastFormError = event.error;
    } else {
      // If no errors, remove it
      this.formErrors.delete(date);
    }

    this.updateErrorMessage(!event.failed);
  }

  /**
   * Updates form error message state
   * @param popPreviousError Print previous error
   */
  private updateErrorMessage(popPreviousError = false) {
    // Determine if some errors left
    this.formHasError = this.formErrors.size > 0;

    if (!this.formHasError) {
      // Clear message if no errors left
      this.lastFormError = null;
    } else if (popPreviousError) {
      // Get previous error from the error messages stack
      // if required.
      this.lastFormError = this.formErrors.values().next().value;
    }
  }

  /**
   * Returns menu for specified date
   * @param date Date in format YYYYMMDD
   */
  getMenuForDate(date: string): IDish[] {
    return isArray(this.menus[date]) ? this.menus[date] : [];
  }

  /**
   * Gets array of item ids
   * @param day Date in format (YYYYMMDD)
   */
  getDayOrders(day: string): number[] {
    if (isNil(this.ordered)) {
      return [];
    }

    const value = this.ordered[day];

    return isArray(value) ? value : [];
  }

  /**
   * Fetch data from the server
   */
  async fetchData() {
    this.dirty = false;
    const start = this.period[0];
    const end = this.period[1];
    this.isLoading = true;
    this.ordered = null;

    try {
      // Fetch menus
      const menus = await this.menu.getDishesForPeriod(start, end);
      this.menus = <MenuSet> menus;

      const userId = this.session.currentUser.id;
      this.ordered = await this.orders.getUserOrdersForPeriod(userId, start, end);

      // Set UI state
      this.isLoaded = true;
    } catch (err) {
      this.error = this.helper.extractResponseError(err);
      this.isFailed = true;
    }
  }

}
