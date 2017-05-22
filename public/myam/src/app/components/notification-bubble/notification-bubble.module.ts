import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NotificationBubbleComponent } from './notification-bubble.component';

@NgModule({
  imports: [
  	CommonModule,
  	FormsModule,
  	BrowserAnimationsModule
  ],
  declarations: [
    NotificationBubbleComponent
  ],
  providers: [],
  exports: [NotificationBubbleComponent]
})
export class NotificationBubbleModule {}
