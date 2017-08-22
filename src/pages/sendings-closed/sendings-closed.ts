import { FirebaseListObservable } from 'angularfire2/database/firebase_list_observable';
import { APP_CFG } from '../../models/app-model';
import { App, LoadingController } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { SendingDetailPage } from '../sending-detail/sending-detail';

import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings-closed',
    templateUrl: 'sendings-closed.html',
})
export class SendingsClosedPage implements OnInit {

    sendings: FirebaseListObservable<any>;
    appName:string = APP_CFG.ENVIRONMENTS[APP_CFG.CURRENT_ENV].APP_NAME;

    constructor(public viewCtrl: ViewController,
        public loadingCtrl: LoadingController,
        public sendingSrv: SendingService,
        private app: App) {
    }

    ngOnInit() {
        console.info('_sendings_');
    }

    ionViewWillEnter() {
        console.log('_willEnter');
        this.getAllClosed();  
    }

    ionViewWillLeave() {
        console.log('_willLeave');
        this.unbind();
    }

    goToDetail(key: string) {
        console.log('_goToDetail()', key);
        this.app.getRootNavs()[0].push(SendingDetailPage, { sendingId: key });
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

    private getAllClosed() {
        console.log('_getAll');
        this.sendings = this.sendingSrv.getAllClosedObs();
    }

    private unbind() {
        this.sendings = null;
    }

}
