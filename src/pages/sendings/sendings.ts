import { LoadingController } from 'ionic-angular/components/loading/loading';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingDetailPage } from '../sending-detail/sending-detail';
import { CheckoutPage } from '../checkout/checkout';

import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings',
    templateUrl: 'sendings.html',
})
export class SendingsPage implements OnInit {

    sendings: any;
    sendingsEmpty = true;
    sendingsSuscription: any;

    constructor(public viewCtrl: ViewController,
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public sendingsService: SendingService) {
    }

    ngOnInit() {
        this.viewCtrl.didEnter.subscribe( () => {
            console.log('sending > didEnter');
            this.getAllActive();            
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('sending > didLeave');
            this.sendingsSuscription.unsubscribe();
        });
    }

    goToDetail(key: string) {
        console.log('go to detail > ', key);
        // loader
        let loader = this.loadingCtrl.create({
            content: "Cargando ...",
        });
        loader.present();        
        // get
        let service = this.sendingsService.getSending(key);
        service.subscribe(snapshot => {
            console.log('getSending > success');
            loader.dismiss();
            this.navCtrl.push(SendingDetailPage, { sending: snapshot.val() });
        });
    }

    goToCheckout(key: string) {
        console.log('go to checkout > ', key);
        // loader
        let loader = this.loadingCtrl.create({
            content: "Cargando ...",
        });
        loader.present();        
        // get
        let service = this.sendingsService.getSending(key);
        service.subscribe(snapshot => {
            console.log('getSending > success');
            loader.dismiss();
            this.navCtrl.push(CheckoutPage, { sending: snapshot.val() });
        });
    }    

    createSending() {
        this.navCtrl.setRoot(SendingCreatePage);
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);

        this.getAllActive();

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
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
        console.log('sendings suscription > getAllActive');
        this.sendings = [];
        let listRef = this.sendingsService.getAllMyActiveRef();
        this.sendingsSuscription = listRef.subscribe(snapshots => {
            if (snapshots) {
                snapshots.forEach(snapshot => {
                    let key = snapshot.key;
                    let item = {
                        key: key,
                        data: snapshot.val(),
                    };
                    this.sendings.push(item);
                });
            }
            if (this.sendings.length > 0) {
                this.sendingsEmpty = false;
            } else {
                this.sendingsEmpty = true;
            }
        });
    }

}
