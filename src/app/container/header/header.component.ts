import {Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter} from '@angular/core';
import {IUser} from '../../shared/interfaces/user';
import { EnvironmentService } from '../../shared/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit {

  /**
   * User
   * @type {any}
   */
  @Input() user: IUser = null;

  /**
   * Event fires when user clicks "logout" button
   * @type {EventEmitter<any>}
   */
  @Output() logout = new EventEmitter();

  title = 'FoodCourt';

  get isAdmin() {
    return this.user.level === 0;
  }

  constructor(private env: EnvironmentService) { }

  ngOnInit() {
    this.title = this.env.getFullProductName();
  }

  onLogoutClick(event: Event) {
    event.preventDefault();
    this.logout.emit();
  }

}
