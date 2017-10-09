import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings-notifications',
    templateUrl: 'sendings-notifications.html',
})
export class SendingsNotificationsPage {

    notifications:any;

    constructor(public navCtrl: NavController,
        public sendingSrv: SendingService) {

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

    private getAll() {
        console.log('_getAll');
        this.notifications = [];
        let obs = this.sendingSrv.getAllNotifications(true);
        obs.subscribe(snap => {
            snap.forEach(childsnap => {
                console.log('sendingid', childsnap.key);
                let notifObj = childsnap.val();
                let notifs = [];
                let publicId = '';
                for(let index in notifObj) {
                    console.log(index);
                    console.log(notifObj[index]);
                    notifs.push(notifObj[index]);
                    publicId = publicId=='' ? notifObj[index].publicId : publicId;
                }
                let item = {
                    sendingId: childsnap.key,
                    publicId: publicId,
                    notifs: notifs,
                }
                this.notifications.push(item);
            });
            
        });

    }

    private unbind() {
        this.notifications = null;
    }    

}
