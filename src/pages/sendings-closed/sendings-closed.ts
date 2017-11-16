import { APP_CFG } from '../../models/app-model';
import { App, LoadingController } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { SendingClosedDetailPage } from '../sending-closed-detail/sending-closed-detail';

import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings-closed',
    templateUrl: 'sendings-closed.html',
})
export class SendingsClosedPage implements OnInit {

    sendings: any[];
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
        this.app.getRootNavs()[0].push(SendingClosedDetailPage, { sendingId: key });
    }

    getStatusMessage(currentStageStatus) {
        let data:any = {
            message: '',
            color: 'primary',
            mode: 'note'
        };
        switch (currentStageStatus) {
            case 'closed_completed':
                data.message = 'Entregado';
                break;
            case 'closed_autocompleted':
                data.message = 'Autocompletado';
                break;
            case 'closed_canceledbysender':
                data.message = 'Cancelado por Solicitante';
                break;
            case 'closed_canceledbyoperator':
                data.message = 'Concelado por Operador';
                break;
            case 'closed_payexpired':
                data.message = 'Venció antes del pago';
                break;
            case 'closed_waitoperatorexpired':
                data.message = 'Venció antes de tener Operador';
                break;            
        }
        return data;
    }

    /**
     *  PRIVATE
     */

    private getAllClosed() {
        console.log('_getAll');
        let obs = this.sendingSrv.getAllClosedObs(true, 50);
        obs.subscribe(snap => {
            this.sendings = [];
            snap.forEach(childsnap => {
                let key = {
                    $key: childsnap.key 
                }
                let obj = childsnap.val();
                obj = Object.assign(obj, key);
                this.sendings.unshift(obj);
            });
        });
    }

    private unbind() {
        this.sendings = null;
    }

}
