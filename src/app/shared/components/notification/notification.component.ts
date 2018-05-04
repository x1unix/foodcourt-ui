import { Component, OnInit } from '@angular/core';
import { NotificationEvent, NotificationType, NotificationsService } from '../../services';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  /**
   * Notifications push subscription
   */
  private subscription: Subscription;

  /**
   * All notifications
   */
  notifications: NotificationEvent[] = [];

  constructor(private notificationsService: NotificationsService) { }

  ngOnInit() {
    // Listen for incoming notifications
    this.subscription = this.notificationsService.listen((notification) => {
      // Add notification to view
      const idx = this.notifications.push(notification);

      // Self-destroy timeout
      setTimeout(() => this.remove(idx), notification.timeout);
    });
  }

  /**
   * Returns notification icon by type
   *
   * @param notificationType Notification type
   */
  getNotificationIcon(notificationType: NotificationType): string {
    switch (notificationType) {
      case NotificationType.Danger:
        return 'exclamation-circle';
      case NotificationType.Warning:
        return 'exclamation-triangle';
      case NotificationType.Success:
        return 'check-circle';
      default:
        return 'info-circle';
    }
  }

  remove(notificationIndex: number) {
    this.notifications.splice(notificationIndex, 1);
  }

}
