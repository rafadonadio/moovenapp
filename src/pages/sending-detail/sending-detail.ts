import { SendingRequest } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage implements OnInit {

    sendingtab:string = "notifications";
    sending:SendingRequest;
    notifications:Array<any>;
    private _platform: Platform;
    private _isAndroid: boolean;
    private _isiOS: boolean;
    private _isCore: boolean;

    constructor(public platform: Platform,
        public navCtrl: NavController,
        public navParams: NavParams) {
        this._platform = platform;
        this._isAndroid = platform.is('android');
        this._isiOS = platform.is('ios');
        this._isCore = platform.is('core');           
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        console.info('navParams > ', this.sending);
        this.convertNotificationsToArray();        
    }

    private convertNotificationsToArray() {
        this.notifications = [];
        let notifis = this.sending._notifications;
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            let item = {
                key: key,
                data: notifis[key]
            };
            this.notifications.push(item);
        }
        //console.log(this.notifications);
    }
}
