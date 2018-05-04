import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { isString } from 'lodash';

@Injectable()
export class EnvironmentService {

  private readonly PRODUCT_NAME = 'FoodCourt';

  constructor() { }

  /**
   * Returns full product name with company owner
   */
  getFullProductName(): string {
    const companyName = environment['companyName'];
    if (companyName) {
      return `${companyName} ${this.PRODUCT_NAME}`;
    }

    return this.PRODUCT_NAME;
  }

}
