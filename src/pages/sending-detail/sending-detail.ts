import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage implements OnInit {

    sendingtab:string = "notifications";
    sending:any;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        console.info('navParams > ', this.sending);
        this.convertNotificationsToArray();        
    }

    convertNotificationsToArray() {
        this.notifications = [];
        let notifis = this.sending._notifications;
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            notifis[key].key = key;
            this.notifications.push(notifis[key]);
        }
        console.log(this.notifications);
    }


}
