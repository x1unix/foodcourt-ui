import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { LoadStatusComponent } from '../shared/helpers';
import { MenuService, WebHelperService } from '../shared/services';
import { IDish, MenuSet } from '../shared/interfaces/dish';
import { IKeyValuePair } from '../shared/interfaces/key-value-pair';
import { isArray } from 'lodash';



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
   * Selected start date
   */
  private startDate: moment.Moment;

  /**
   * Date and menu dictionary
   */
  private menus: MenuSet = null;

  private period: string[] = [];

  /**
   * Set date for weekly viewer
   */
  set date(newDate: moment.Moment) {
    // Create a new date with week start.
    // isoWeek means that Monday is start day.
    const date = newDate.startOf('isoWeek');

    // Clone the date and save it.
    this.startDate = date.clone();

    // Prepare list of days
    const datesList = [];

    // Iterate through each day and generate the list
    for (let i = 0, ii = 4; i <= ii; i++) {
      // Add one day and format to FoodCourt date format.
      // moment.add() operation is mutable, so it will modify
      // the date variable each time and return itself.
      datesList.push(date.add(1, 'd').format(this.FC_DATE_FORMAT));
    }

    this.period = [
      datesList[0],
      datesList[datesList.length - 1]
    ];

    this.dates = datesList;
  }

  constructor(private menu: MenuService, private helper: WebHelperService) {
    super();
  }

  ngOnInit() {
    this.date = moment();
    this.fetchData();
  }

  /**
   * Returns menu for specified date
   * @param date Date in format YYYYMMDD
   */
  getMenuForDate(date: string): IDish[] {
    return isArray(this.menus[date]) ? this.menus[date] : [];
  }

  /**
   * Fetch data from the server
   */
  async fetchData() {
    const start = this.period[0];
    const end = this.period[1];
    this.isLoading = true;

    try {
      // Fetch menus
      const menus = await this.menu.getDishesForPeriod(start, end);
      this.menus = <MenuSet> menus;

      // Set UI state
      this.isLoaded = true;
    } catch (err) {
      this.error = this.helper.extractResponseError(err);
      this.isFailed = true;
    }
  }

}
