import { Component, Input } from '@angular/core';


import { ProfileService } from '../../../service/profile.service';
import { CurrencyService } from '../../../service/currency.service';

import './add-db-pop-out.style.less';

@Component({
  selector: '[add-db-pop-out]',
  template: require('./add-db-pop-out.template.html'),
  providers: [
    ProfileService,
    CurrencyService
  ]
})

export class AddDbPopOutDirectiveComponent {
  @Input() callback;

  private currencyList;
  private dbName;
  private currencyType;
  private uploadFile;
  private showUploadBlock;

  constructor(
    private profileService: ProfileService,
    private currencyService: CurrencyService
  ) {
    this.currencyList = this.currencyService.getCurrencyList();
    this.currencyType = 'USD';
  };

  selectUploadFile(event){
    this.uploadFile = event.srcElement.files;
  }

  async createDB() {
    if(this.showUploadBlock){
      if(this.uploadFile){
        const _res = await this.profileService.uploadDB(this.dbName, this.uploadFile[0]);

        this.callback(_res['success'] ? this.dbName : null);         
      } 
    } else {
      await this.profileService.createDB(this.dbName, this.currencyType);
      this.callback(this.dbName);      
    }
  }
}
