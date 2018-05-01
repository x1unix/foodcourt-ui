import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { SharedModule } from '../shared/shared.module';
import { DayColumnComponent } from './day-column/day-column.component';
import { DishGroupComponent } from './dish-group/dish-group.component';
import { WeeklyViewComponent } from './weekly-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,
    SharedModule
  ],
  declarations: [DayColumnComponent, DishGroupComponent, WeeklyViewComponent]
})
export class WeeklyViewModule { }
