import { Subscription } from 'rxjs/Rx';
import { ConfigService } from '../../providers/config-service/config-service';
import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
    selector: 'modal-tos',
    templateUrl: 'modal-tos.html',
})
export class ModalTosPage {

    current: any;
    subsc: Subscription;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        private configSrv: ConfigService) {

    }

    ionViewWillEnter() {
        let obs = this.configSrv.getCurrentToS();
        this.subsc = obs.subscribe((snap) => {
                        console.log('getCurrentToS success');
                        this.current = snap.val();
                    }, err => {
                        console.log('err', err);
                    });
    }

    ionViewWillUnload() {
        if(this.subsc) {
            console.log('bye tos');
            this.subsc.unsubscribe();
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }



}
