import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage implements OnInit {

    sendingtab:string = "shipment";
    sending:any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        console.info('navParams > ', this.sending);
    }



}
