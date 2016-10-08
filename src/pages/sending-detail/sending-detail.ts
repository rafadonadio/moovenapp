import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage {

    sendingtab: string = "state";

    constructor(public navCtrl: NavController) {

    }

}
