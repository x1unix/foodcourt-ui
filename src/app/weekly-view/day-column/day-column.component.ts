import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment'; 

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

  constructor() { }

  ngOnInit() {
  }

}
