import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { LoadStatusComponent } from '../shared/helpers';

@Component({
  selector: 'app-weekly-view',
  templateUrl: './weekly-view.component.html',
  styleUrls: ['./weekly-view.component.scss']
})
export class WeeklyViewComponent extends LoadStatusComponent implements OnInit {

  dates = [];

  private readonly FC_DATE_FORMAT = 'YYYYMMDD';

  private startDate: moment.Moment;

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

    this.dates = datesList;
  }

  constructor() {
    super();
  }

  ngOnInit() {
    this.date = moment();
  }

}
