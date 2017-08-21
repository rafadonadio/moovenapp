import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { APP_CFG } from '../../models/app-model';
import { App, LoadingController } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingDetailPage } from '../sending-detail/sending-detail';
import { CheckoutPage } from '../checkout/checkout';

import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings-active',
    templateUrl: 'sendings-active.html',
})
export class SendingsActivePage implements OnInit {

    sendings: FirebaseListObservable<any>;
    appName:string = APP_CFG.ENVIRONMENTS[APP_CFG.CURRENT_ENV].APP_NAME;

    constructor(public viewCtrl: ViewController,
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public sendingSrv: SendingService,
        private app: App) {
    }

    ngOnInit() {
        console.info('_sendings_');
    }

    ionViewWillEnter() {
        console.log('_willEnter');
        this.getAllActive();  
    }

    ionViewWillLeave() {
        console.log('_willLeave');
        this.unbind();
    }

    goToDetail(key: string) {
        console.log('_goToDetail()', key);
        this.app.getRootNav().push(SendingDetailPage, { sendingId: key });
    }

    goToCheckout(key: string) {
        console.log('_goToCheckout()', key);
        // loader
        let loader = this.loadingCtrl.create({
            content: "Cargando ...",
        });
        loader.present();        
        // get
        let obs = this.sendingSrv.getByIdObs(key, true);
        let subsc = obs.subscribe(snap => {
            loader.dismiss();
            subsc.unsubscribe();
            this.app.getRootNav().push(CheckoutPage, { sending: snap.val() });
        });
    }    

    createSending() {
        this.app.getRootNav().setRoot(SendingCreatePage);
    }

    getStatusMessage(currentStageStatus) {
        let data:any = {
            message: '',
            color: 'primary',
            mode: 'note'
        };
        switch (currentStageStatus) {
            case 'created_registered':
                data.message = 'PAGAR';
                data.color = 'danger';
                data.mode = 'button';
                break;
            case 'created_paid':
                data.message = 'Verificando pago';
                break;
            case 'created_enabled':
            case 'live_waitoperator':
                data.message = 'Aguardar Operador';
                break;
            case 'live_gotoperator':
            case 'live_waitpickup':
                data.message = 'Aguardar Retiro';
                break;
            case 'live_pickedup':
            case 'live_inroute':
                data.message = 'En transito';
                break;
            case 'live_dropped':
            case 'closed_completed':
                data.message = 'Entregado';
                break;
        }
        return data;
    }

    /**
     *  PRIVATE
     */

    private getAllActive() {
        console.log('_getAll');
        this.sendings = this.sendingSrv.getAllActiveObs();
    }

    private unbind() {
        this.sendings = null;
    }

}
