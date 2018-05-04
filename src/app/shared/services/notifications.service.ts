import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

/**
 * Notification types
 */
export enum NotificationType {
  Danger = 'alert-danger',
  Warning = 'alert-warning',
  Success = 'alert-success',
  Info = 'alert-info'
}

export interface NotificationEvent {
  message: string;
  type: NotificationType;
  timeout: number;
}

@Injectable()
export class NotificationsService {

  /**
   * Message queue
   */
  private messages = new Subject<NotificationEvent>();

  constructor() { }

  /**
   * Listen for incoming notifications
   * @param callback Callback
   */
  listen(callback: (notification: NotificationEvent) => void): Subscription {
    return this.messages.subscribe((event: NotificationEvent) => callback(event));
  }

  /**
   * Push notification
   *
   * @param message Message
   * @param type Notification type
   * @param timeout Notification timeout
   */
  push(message: string, type: NotificationType = NotificationType.Info, timeout = 3000) {
    this.messages.next({message, type, timeout});
  }
}
