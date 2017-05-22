import { Component } from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { NotificationHandler } from '../../handler/notification.handler';

import './notification-bubble.style.less';

@Component({
  selector: 'notification-bubble',
  template: require('./notification-bubble.template.html'),
  providers: [
    NotificationHandler
  ],
  animations: [
    trigger('flyInOut', [
        transition(
        ':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('300ms', style({transform: 'translateX(0)', opacity: 1}))
        ]
      ),
      transition(
        ':leave', [
          style({transform: 'translateX(0)', 'opacity': 1}),
          animate('300ms', style({transform: 'translateX(100%)', opacity: 0}))
        ]
      )
    ])
  ]
})
export class NotificationBubbleComponent {
  private __isInit;
  private __meta = {};

  private msgPool = [];

  private notificationId;

  constructor(
    private notificationHandler: NotificationHandler
  ) {}

  async ngOnInit() {
    this.notificationId = this.notificationHandler.registCallback(this.notificationCallback);
    this.__isInit = true;
  };

  async __checkDataUpToDate() {}

  notificationCallback = (type, msg) => {
    let _item = { type: type, msg: msg };
    this.msgPool.unshift(_item);

    setTimeout(() => this.msgPool.pop(), type == 'error'? 5000 : 3000);
  }

  remove(item){
    this.msgPool.splice(this.msgPool.indexOf(item), 1);
  }
}
