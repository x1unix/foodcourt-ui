import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {IDish, DISH_TYPES, DISH_TYPE_COLORS, DishType} from '../interfaces/dish';

@Injectable()
export class MenuService {

  constructor(private http: HttpClient) { }

  get dishType() {
    return DishType;
  }

  get dishTypes() {
    return DISH_TYPES;
  }

  /**
   * Get dish category name
   * @param {number} categoryId Category index
   * @returns {string}
   */
  getDishCategory(categoryId: number): string {
    return this.dishTypes[categoryId];
  }

  /**
   * Get dish category color
   * @param {number} catId Category index
   * @returns {string}
   */
  getDishCategoryColor(catId: number): string {
    return DISH_TYPE_COLORS[catId];
  }

  /**
   * Get list of dishes in menu for a specific date.
   *
   * @param {string} date Menu date (date format must be YYYYMMDD (for ex. 20171121))
   * @returns {Observable<IDish[]>}
   */
  getDishes(date: string): Observable<IDish[]> {
    return <Observable<IDish[]>> this.http.get(`/api/menu/${date}/dishes`);
  }

  /**
   * Get menu for selected period.
   *
   * @param {string} startDate Start date in format YYYYMMDD
   * @param {string} endDate End date in format YYYYMMDD
   */
  getDishesForPeriod(startDate: string, endDate: string) {
    const params = new HttpParams().set('from', startDate).set('till', endDate);
    return this.http.get('/api/menu/period/dishes', { params }).toPromise();
  }

  /**
   * Set a list of dishes as a menu for specific date
   * @param {string} date Date (format: YYYYMMDD)
   * @param {number[]} dishesIds List of dishes IDs
   * @returns {Observable<Object>}
   */
  setDishesForDate(date: string, dishesIds: number[]) {
    return this.http.post(`/api/menu/${date}/dishes`, dishesIds);
  }

  /**
   * Clear menu items
   * @param date Date (format: YYYYMMDD)
   */
  clearMenu(date) {
    return this.http.delete(`/api/menu/${date}`);
  }

  /**
   * Gets menu status
   * @param {string} date
   * @returns {Observable<ILockStatus>}
   */
  getMenuStatus(date: string) {
    return this.http.get(`/api/menu/${date}/status`);
  }

  /**
   * Returns status for each menu for specified days
   * @param dates Array of dates (format: YYYYMMDD)
   */
  getBulkMenuStatus(dates: string[]): Promise<{[date: string]: boolean}> {
    let params = new HttpParams();

    // Append date to query param
    dates.forEach(date => {
      params = params.append('dates[]', date);
    });

    return <Promise<{ [date: string]: boolean }>> this.http.get('/api/menu/status', { params }).toPromise();
  }

}
