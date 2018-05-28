import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { isArray, isNil } from 'lodash';
import { LoadStatusComponent, ResourceStatus, ObjectDiffer } from '../shared/helpers';
import { MenuService, WebHelperService, SessionsService, OrdersService, NotificationsService, NotificationType } from '../shared/services';
import { IDish, MenuSet } from '../shared/interfaces/dish';
import { IKeyValuePair } from '../shared/interfaces/key-value-pair';
import { DayColumnEvent } from './day-column/day-column-event';
import { NavigationDirection } from './view-footer/navigation-direction';

/**
 * Weekly view page
 */
@Component({
  selector: 'app-weekly-view',
  templateUrl: './weekly-view.component.html',
  styleUrls: ['./weekly-view.component.scss']
})
export class WeeklyViewComponent extends LoadStatusComponent implements OnInit, OnDestroy {

  private readonly FC_DATE_FORMAT = 'YYYYMMDD';

  private readonly DAY_SUNDAY = 7;

  private readonly DAY_SATURDAY = 6;

  private readonly DAYS_TOTAL = 7;

  /**
   * Order save status
   */
  saveStatus = new ResourceStatus();

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
   * Current date (in FC format)
   */
  today = '';

  /**
   * Order owner ID
   */
  private userId: number;

  /**
   * List of dates with changed orders
   */
  private dirtyDates: string[] = [];

  /**
   * Lock status information
   */
  private lockStatus: {[date: string]: boolean} = {};

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
    private helper: WebHelperService,
    private notifications: NotificationsService
  ) {
    super();
  }

  /**
   * Returns first day of the current week.
   * If today is holiday (sunday, monday), jumps to the next week
   */
  private determineStartDay(): moment.Moment {
    const today = moment();

    // Current week day (ISO)
    const weekday = today.isoWeekday();

    if (weekday >= this.DAY_SATURDAY) {
      // Jump to the next monday if today is saturday or sunday
      const skipCount = (this.DAYS_TOTAL - weekday) + 1;
      return today.add(skipCount, 'd').clone();
    }

    // Otherwise, just jump to current week start
    return today.clone().startOf('isoWeek');
  }

  ngOnInit() {
    // Set today's date
    this.today = moment().format(this.FC_DATE_FORMAT);

    this.userId = this.session.currentUser.id;

    // Determine start day
    this.date = this.determineStartDay();
    this.fetchData();
  }

  /**
   * Weekly view navigation event handler
   * @param direction Navigation direction
   */
  onNavigate(direction: NavigationDirection) {
    // Warn when user didn't save his changes and leaving the page
    if (this.dirty && !window.confirm(`You didn't save your changes, are you sure you want to leave?`)) {
      return;
    }

    const tempDate = this.startDate.clone();
    this.isLoading = true;

    switch (direction) {
      case NavigationDirection.Forward:
        this.date = tempDate.add(1, 'w');
        break;
      case NavigationDirection.Backward:
        this.date = tempDate.subtract(1, 'w');
        break;
      default:
        return;
    }

    this.fetchData();
  }

  onSave() {
    if (this.formHasError) {
      return;
    }

    this.saveStatus.isLoading = true;

    // Prepare list only changed orders
    const orderBundle: {[date: string]: number[]} = {};

    // Fill request payload with only changed orders
    Object.keys(this.ordered)
      .filter(key => this.dirtyDates.includes(key))
      .forEach(key => orderBundle[key] = [...this.ordered[key]]);

    // Perform request
    this.orders.setUserOrderForPeriod(this.userId, orderBundle)
      .then(_ => {
        this.notifications.push('Changes saved successfully', NotificationType.Success);
        this.saveStatus.isLoaded = true;
        this.dirty = false;
        this.dirtyDates.length = 0;
      }).catch(err => {
        this.saveStatus.error = this.helper.extractResponseError(err);
        this.saveStatus.isFailed = true;
        this.notifications.push(
          `Failed to save the order: ${this.saveStatus.error}`,
          NotificationType.Danger,
          8000
        );
      });
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

    if (!this.dirtyDates.includes(date)) {
      // Add changed date to the list of affected dates
      this.dirtyDates.push(date);
    }

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

  getPopUpPosition(menuIdx: number): string {
    const max = this.dates.length - 3;

    return menuIdx >= max ? 'left' : 'right';
  }

  /**
   * That might be obvious
   * @param date FC Date
   */
  isMenuLocked(date: string): boolean {
    return this.lockStatus[date] || false;
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
   * Reset component state
   * @param dispose Dispose component
   *
   */
  private reset(dispose = false) {
    this.ordered = null;
    this.dirty = false;
    this.lastFormError = null;
    this.formHasError = false;
    this.menus = null;
    this.dirtyDates = [];
    this.lockStatus = {};
    this.formErrors.clear();

    if (dispose) {
      // Prepare component for destroy
      this.destroyed = true;

      // Null properties
      this.startDate = null;
      this.period = null;
      this.formErrors = null;
      this.lockStatus = null;
      this.dirtyDates = null;
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
    // Reset component state
    this.reset();

    // Set loading state
    this.isLoading = true;

    // Set week range
    const start = this.period[0];
    const end = this.period[1];

    try {
      // Fetch menus
      const menus = await this.menu.getDishesForPeriod(start, end);
      this.menus = <MenuSet> menus;

      // Fetch user's orders
      this.ordered = await this.orders.getUserOrdersForPeriod(this.userId, start, end);

      // Get menu lock status
      this.lockStatus = await this.menu.getBulkMenuStatus(this.dates);

      // Set UI state
      this.isLoaded = true;
    } catch (err) {
      this.error = this.helper.extractResponseError(err);
      this.isFailed = true;
    }
  }

  ngOnDestroy() {
    this.reset(true);
  }

}
