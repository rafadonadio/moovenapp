import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the SendingDetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'sending-detail.html',
})
export class SendingDetailPage {

  sendingtab: string = "state";

  constructor(private navCtrl: NavController) {

  }

}
