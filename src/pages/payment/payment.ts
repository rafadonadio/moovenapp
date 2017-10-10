import { PaymentService } from '../../providers/payment-service/payment-service';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-payment',
    templateUrl: 'payment.html',
})
export class PaymentPage {

    payments:any;
    toggler:any = {};

    constructor(public navCtrl: NavController,
        private paymentSrv: PaymentService) {
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
        this.payments = [];
        let obs = this.paymentSrv.getAllObs(true);
        obs.subscribe(snap => {
            snap.forEach(childsnap => {
                let obj = childsnap.val();
                let paymentId = childsnap.key;
                let key = {
                    $key: paymentId,
                }
                obj = Object.assign(obj, key);
                this.payments.unshift(obj);
                // toggle 
                this.toggler[paymentId] = false;
            }, err => console.log('error', err));
        });
    }

    toggleDetail(id:string) {
        this.toggler[id] = this.toggler[id]==true ? false : true;
    }    

    private unbind() {
        this.payments = null;
    }    

}
