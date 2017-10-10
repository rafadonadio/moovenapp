import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount, UserAccountOperator } from '../../models/user-model';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ShipmentClosedDetailPage } from '../shipment-closed-detail/shipment-closed-detail';

@Component({
    selector: 'page-shipments-notifications',
    templateUrl: 'shipments-notifications.html',
})
export class ShipmentsNotificationsPage {

    // operatorAuth flags
    operatorAuthUnchecked:any;
    // account
    accountSubs: Subscription;
    account: UserAccount;
    operator: UserAccountOperator;
    notifications:any;
    toggler:any = {};

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private shipmentSrv: ShipmentsService) {
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
     * get all notifications
     * order descendent
     * limit to 100
     */
    private getAll() {
        console.log('_getAll');
        this.notifications = [];
        let obs = this.shipmentSrv.getAllNotifications(true);
        obs.subscribe(snap => {
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
                    shipmentId: childsnap.key,
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

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        this.app.getRootNavs()[0].push(ShipmentClosedDetailPage, { 
            shipmentId: data.shipmentId,
            sendingId: data.sendingId,
        });         
    }

    private unbind() {
        this.notifications = null;
    }  

}
