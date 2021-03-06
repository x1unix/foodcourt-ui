import { Component, OnInit } from '@angular/core';
import { isNil, groupBy, isObject } from 'lodash';
import * as moment from 'moment';
import { DatepickerOptions } from '../../shared/components/datepicker';

import {DishesService} from '../services/dishes.service';
import {IDish} from '../../shared/interfaces/dish';
import {ResourceStatus} from '../../shared/helpers/resource-status';
import {WebHelperService, MenuService} from '../../shared/services';
import { DropEvent } from '../../shared/interfaces/drop-event';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {ILockStatus} from '../../shared/interfaces/lock-status';

const ITEMS_QUERY = {
  orderBy: 'label',
  orderDir: 'asc'
};

const DISPLAYED_DATE_FORMAT = 'dddd, MMMM DD YYYY';
const SERVED_DATE_FORMAT = 'YYYYMMDD';

/**
 * Menu editor page component
 */
@Component({
  selector: 'app-menu-editor',
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss']
})
export class MenuEditorComponent implements OnInit {

  /**
   * List of all available dishes
   * @type {Array}
   */
  dishes: IDish[] = [];

  /**
   * List of dishes in menu
   * @type {Array}
   */
  menuItems: IDish[][] = [];

  /**
   * Dishes list fetch progress status
   * @type {ResourceStatus}
   */
  dishesStatus = new ResourceStatus();

  /**
   * Menu save progress status
   * @type {ResourceStatus}
   */
  saveStatus = new ResourceStatus();

  /**
   * Menu delete progress status
   * @type {ResourceStatus}
   */
  deleteStatus = new ResourceStatus();

  /**
   * Menu items fetch status
   * @type {ResourceStatus}
   */
  menuItemsStatus = new ResourceStatus();

  /**
   * Date to be displayed on UI
   * @type {any}
   */
  displayedDate: string = null;

  /**
   * List of selected id's
   * @type {Array}
   */
  selectedIds: number[] = [];

  /**
   * Initial size of the collection
   * @type {number}
   */
  initialSize = 0;

  catalogDropZone = ['allItemsZone'];

  cartDropZone = ['selectedItemsZone'];

  /**
   * Is drag-and-drop in process
   * @type {boolean}
   */
  dragTrashStart = false;

  /**
   * Is collection changed
   * @type {boolean}
   */
  collectionChanged = false;

  /**
   * ng2-datepicker options
   * @type {any}
   */
  datePickerOptions: DatepickerOptions = null;

  pickedDate: Date = null;

  /**
   * If menu is editable
   * @type {boolean}
   */
  menuEditable = true;

  /**
   * Date to be send on server
   * @type {any}
   */
  private servedDate: string = null;

  /**
   * Selected date in form (private)
   * @type {any}
   */
  private selectedDate: moment.Moment = null;

  /**
   * Current selected date
   * @returns {moment.Moment}
   */
  get date(): moment.Moment {
    return this.selectedDate;
  }

  set date(newDate: moment.Moment) {
    this.selectedDate = newDate;
    this.displayedDate = newDate.format(DISPLAYED_DATE_FORMAT);
    this.servedDate = newDate.format(SERVED_DATE_FORMAT);
  }

  get dishTypes() {
    return this.dishesCatalogue.dishTypes;
  }

  get menuEmpty(): boolean {
    return this.selectedIds.length === 0;
  }

  constructor(private dishesCatalogue: DishesService, private helper: WebHelperService, private menu: MenuService) {}

  ngOnInit() {
    this.date = moment();
    this.pickedDate = this.date.toDate();
    this.initDatePickerOptions();
    this.getAllDishes();
    this.updateMenuItemsList();
  }

  patchUrl(urlString: string) {
    return this.helper.patchUrlString(urlString);
  }

  initDatePickerOptions() {
    const currentYear = this.date.year();
    this.datePickerOptions = {
      minYear: currentYear,
      // firstCalendarDay: 1,
      displayFormat: SERVED_DATE_FORMAT
    };
  }

  /**
   * Gets category name
   * @param {number} catId Category id
   * @returns {string}
   */
  getDishCategory(catId: number) {
    return this.dishesCatalogue.getDishCategory(catId);
  }

  /**
   * Gets category color
   * @param {number} catId Category id
   * @returns {string}
   */
  getDishCategoryColor(catId: number) {
    return this.dishesCatalogue.getDishCategoryColor(catId);
  }

  updateMenuItemsList() {
    this.deleteStatus.isIdle = true;
    this.saveStatus.isIdle = true;
    this.menuItemsStatus.isLoading = true;
    this.selectedIds = [];
    this.collectionChanged = false;
    this.initialSize = 0;
    this.menuEditable = true;

    const menu = this.menu.getDishes(this.servedDate);
    const status = this.menu.getMenuStatus(this.servedDate);

    forkJoin([menu, status]).subscribe(
      (results) => this.onMenuItemsFetch.apply(this, results),
      (e) => this.onMenuItemsFail(e)
    );
  }

  /**
   * Menu data fetch event handler
   * @param {IDish[]} items Menu items
   * @param {ILockStatus} menuStatus Menu lock status
   */
  onMenuItemsFetch(items: IDish[] = null, menuStatus: ILockStatus) {
    // Set load status
    this.menuItemsStatus.isLoaded = true;

    this.collectionChanged = false;
    this.selectedIds = [];

    this.menuEditable = isObject(menuStatus) && (menuStatus.locked === false);

    // Create new empty collection with empty sub-arrays for each category
    this.menuItems = this.dishTypes.map((i) => []);

    // Group by class and fill the collection
    if (!isNil(items)) {
      // Fill selected ids list
      this.selectedIds = items.map((i) => i.id);
      this.initialSize = this.selectedIds.length;

      const grouped = groupBy(items, 'type');
      Object.keys(grouped).forEach((groupId) => {
        this.menuItems[groupId] = [...grouped[groupId]];
      });
    }
  }

  onMenuItemsFail(error) {
    this.menuItemsStatus.isFailed = true;
    this.menuItemsStatus.error = this.helper.extractResponseError(error);
  }

  getAllDishes() {
    this.dishesStatus.isLoading = true;
    this.dishesCatalogue.getAll(ITEMS_QUERY).subscribe(
      (items: IDish[]) => {
        this.dishesStatus.isLoaded = true;
        this.dishes = items;
      }, (err) => {
        this.dishesStatus.error = this.helper.extractResponseError(err);
        this.dishesStatus.isFailed = true;
      }
    );
  }

  onDrop(data: DropEvent<IDish>) {
    const dish = data.dragData;
    this.collectionChanged = true;
    this.menuItems[dish.type].push(dish);
    this.selectedIds.push(dish.id);
  }

  onItemRemove(dish: IDish) {
    this.dragTrashStart = false;
    this.collectionChanged = true;
    const src = this.menuItems[dish.type];

    if (isNil(src)) {
      return;
    }

    const index = src.indexOf(dish);

    if (index === -1) {
      return;
    }

    src.splice(index, 1);

    // remove from selected id's
    this.selectedIds.splice(this.selectedIds.indexOf(dish.id), 1);
  }

  deleteMenu() {
    const confirmed = window.confirm('Are you sure that you want to delete this menu?');

    if (confirmed) {
      this.deleteStatus.isLoading = true;
      this.menu.clearMenu(this.servedDate).subscribe(
        () => {
          this.deleteStatus.isLoaded = true;
          setTimeout(() => this.deleteStatus.isIdle = true, 3000);

          // Fill empty collection
          this.onMenuItemsFetch([], null);
        }, (err) => {
          this.deleteStatus.isFailed = true;
          this.deleteStatus.error = this.helper.extractResponseError(err);
        }
      );
    }
  }

  saveChanges() {
    this.saveStatus.isLoading = true;
    this.menu.setDishesForDate(this.servedDate, this.selectedIds).subscribe(
      () => {
        this.saveStatus.isLoaded = true;
        this.initialSize = this.selectedIds.length;
        this.collectionChanged = false;
        setTimeout(() => this.saveStatus.isIdle = true, 3000);
      }, (err) => {
        this.saveStatus.isFailed = true;
        this.saveStatus.error = this.helper.extractResponseError(err);
      }
    );
  }

  onDateChange(newDate: Date) {
    this.date = moment(newDate);
    this.updateMenuItemsList();
  }

}
