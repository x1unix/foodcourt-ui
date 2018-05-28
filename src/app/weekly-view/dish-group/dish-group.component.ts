import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IDish } from '../../shared/interfaces/dish';
import { isEmpty } from 'lodash';

const noop = () => {};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DishGroupComponent),
  multi: true
};

/**
 * Dish group selector
 * @export
 * @implements {ControlValueAccessor}
 */
@Component({
  selector: 'app-dish-group',
  templateUrl: './dish-group.component.html',
  styleUrls: ['./dish-group.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DishGroupComponent implements OnInit, ControlValueAccessor {

  /**
   * Dish group title
   */
  @Input() label: string;

  /**
   * Control name
   */
  @Input() name: string;

  /**
   * Highlight control
   */
  @Input() highlight = false;

  /**
   * Pop-up direction
   */
  @Input() popUpDirection = 'right';

  /**
   * Is control disabled
   */
  disabled = false;

  private innerValue = -1;

  // Placeholders for the callbacks which are later providesd
  // by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  /**
   * List of dishes for group
   */
  @Input() dishes: IDish[];

  /**
   * Dish selection change event
   */
  @Output() change = new EventEmitter<IDish>();

  /**
   * get accessor
   */
  get value(): number {
    return this.innerValue;
  }

  /**
   * set accessor value
   */
  set value(v: number) {
    this.innerValue = v;
    this.onChangeCallback(v);
  }

  constructor() { }

  onBlur() {
    this.onTouchedCallback();
  }

  ngOnInit() {
  }

  onItemSelect(item: IDish) {
    // Uncheck item if the same item was selected
    const uncheck = this.value === item.id;

    this.value = uncheck ? null : item.id;
    this.change.emit(uncheck ? null : item);
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    } else {
      this.innerValue = null;
    }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  /**
   * Allows Angular to disable the input.
   * @param {boolean} isDisabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  getPopUpText(item: IDish) {
    return isEmpty(item.description) ? item.label : `${item.label} (${item.description})`;
  }

}
