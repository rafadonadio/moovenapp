import { Subscription } from 'rxjs/Rx';
import { Component } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { SendingService } from '../../providers/sending-service/sending-service';
import { SendingClosedDetailPage } from '../sending-closed-detail/sending-closed-detail';

@Component({
    selector: 'page-sendings-notifications',
    templateUrl: 'sendings-notifications.html',
})
export class SendingsNotificationsPage {

    notifications:any;
    notifSub: Subscription;
    toggler:any = {};

    constructor(public navCtrl: NavController,
        public sendingSrv: SendingService,
        public app: App) {

    }

    ionViewWillEnter() {
        console.log('_willEnter');
        this.getAll();  
    }

    ionViewWillLeave() {
        console.log('_willLeave');
        this.unbind();
    }    

    /**
     *  PRIVATE
     */

    /**
     * get all notifications
     * order descendent
     * limit to 100
     */
    private getAll() {
        console.log('_getAll');
        this.notifications = [];
        let obs = this.sendingSrv.getAllNotifications(true);
        this.notifSub = obs.subscribe(snap => {
            snap.forEach(childsnap => {
                console.log('sendingid', childsnap.key);
                let notifObj = childsnap.val();
                let notifs = [];
                let publicId = '';
                for(let index in notifObj) {
                    // console.log(index);
                    // console.log(notifObj[index]);
                    notifs.unshift(notifObj[index]);
                    publicId = publicId=='' ? notifObj[index].publicId : publicId;
                }
                let item = {
                    sendingId: childsnap.key,
                    publicId: publicId,
                    notifs: notifs,
                }
                this.notifications.unshift(item);
                // toggle 
                this.toggler[childsnap.key] = false;
            }, err => console.log('error', err));
        });
    }

    toggleDetail(id:string) {
        this.toggler[id] = this.toggler[id]==true ? false : true;
    }

    goToSendingDetail(key: string) {
        console.log('_goToDetail()', key);
        this.app.getRootNavs()[0].push(SendingClosedDetailPage, { sendingId: key });
    }

    private unbind() {
        this.notifSub.unsubscribe();
        this.notifications = null;
    }    

}
