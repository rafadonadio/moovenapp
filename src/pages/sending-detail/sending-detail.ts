import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage {

    sendingtab: string = "notifications";

    constructor(public navCtrl: NavController) {

    }

}
