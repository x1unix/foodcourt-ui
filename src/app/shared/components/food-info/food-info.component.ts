import { Component, OnInit, Input } from '@angular/core';
import { isString, isEmpty } from 'lodash';

export const NO_PHOTO_URL = '/assets/dish_no_image.jpg';

@Component({
  selector: 'app-food-info',
  templateUrl: './food-info.component.html',
  styleUrls: ['./food-info.component.scss']
})
export class FoodInfoComponent implements OnInit {

  @Input() label = 'Label';

  @Input() imageUrl = NO_PHOTO_URL;

  @Input() description: string;

  get hasDescription() {
    return isString(this.description) && !isEmpty(this.description);
  }

  constructor() { }

  ngOnInit() {
  }

  onImageLoadError() {
    this.imageUrl = NO_PHOTO_URL;
  }

}
