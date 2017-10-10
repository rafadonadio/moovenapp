import { SendingService } from '../../providers/sending-service/sending-service';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { Alert, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { ShipmentsTabsPage } from '../shipments-tabs/shipments-tabs';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

const TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT;

@Component({
    selector: 'page-shipment-create-2',
    templateUrl: 'shipment-create-2.html',
})
export class ShipmentCreate2Page implements OnInit {

    // sending data
    sendingId:string = '';
    sendingVacant:any;
    // aux
    timer:any;
    timeout:number;
    timesup:boolean;
    confirmAlert:Alert;
    confirmAlertOpen: boolean;
    confirmCanceled: boolean;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendingSrv: SendingService) {
            this.sendingId = navParams.get('sendingId');
            this.sendingVacant = navParams.get('sending');
            console.log('sendingId > ', this.sendingId, this.sendingVacant);
    }

    ngOnInit() {
        this.initTimer();
        this.initConfirmAlert();
    }

    showConfirmAlert() {
        this.confirmAlert.present();
        this.confirmAlertOpen = true;
    }

    showTimerToast() {
        this.presentTimerToast();
    }

    cancel() {
        this.stopTimer();
        this.confirmCanceled = true;
        let loading = this.loadingCtrl.create({
            content: 'cancelando ...'
        });
        loading.present();
        // just try to unlock
        this.unlockSending();
        setTimeout(() => {
            loading.dismiss()
                .then(() => {
                    this.navCtrl.setRoot(ShipmentCreatePage);
                })
        },3000);
    }

    private presentSuccessToast() {
        let toast = this.toastCtrl.create({
            message: 'Tienes una nueva carga!',
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
    }

    private initConfirmAlert():void {
        this.confirmCanceled = false;
        this.confirmAlertOpen = false;
        this.confirmAlert = this.alertCtrl.create({
            title: 'Confirmar',
            message: 'El "Aceptar y Confirmar" es un compromiso de realizar el servicio en los tiempos y condiciones detalladas.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Si, Acepto y Confirmo la toma del servicio',
                    handler: () => {
                        console.log('Confirm clicked');
                        this.confirmAlertOpen = true;
                        this.confirm();
                    }
                }
            ]
        });
        let self = this;
        this.confirmAlert.onDidDismiss(function() {
            console.log('confirmAlert Dismissed');
            self.confirmAlertOpen = false;
        })
    }

    private showAlertAndDie(title:string, message:string):void {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: 'Volver',
                    handler: () => {
                        this.navCtrl.setRoot(ShipmentCreatePage);
                    }
                }
            ]
        });
        alert.present();
    }    

    private confirm() {
        this.stopTimer();
        let loading = this.loadingCtrl.create({
            content: 'Confirmando servicio ...'
        });
        loading.present();
        // process
        this.sendingSrv.setOperator(this.sendingId)
            .then((result) => {
                console.log('setOperator success');
                // done
                loading.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(ShipmentsTabsPage);
                        this.presentSuccessToast();                        
                    });
            })
            .catch((error) => {
                console.log('setOperator error', error);
                loading.dismiss()
                    .then(() => {
                        let title = 'Error';
                        let message = 'Ocurrió un error, por favor vuelve a intentarlo';                         
                        this.showAlertAndDie(title, message);
                    });
            });
    }

    private unlockSending():Promise<any> {
        return this.sendingSrv.unlockVacant(this.sendingId);
    }

    /**
     *  TIMER
     */

    private initTimer() {
        console.info('initTimer');
        // init 
        this.timesup = false;
        let counter = 0;
        this.timer = setInterval(() => {
            counter++;
            console.log(counter);
            this.timeout = TIMEOUT - counter;
            if(this.timeout<=0) {
                this.stopTimer();
                this.timesup = true;
                // Is Confirm Alert Open ?? close it first
                if(this.confirmAlertOpen) {
                    this.confirmAlert.dismiss()
                        .then(() => {
                            this.unlockAndShowTimesupAlert();
                        })
                }else{
                    this.unlockAndShowTimesupAlert();
                }
            } 
        }, 1000);
        this.showTimerToast();
    }

    private stopTimer() {
        console.info('timer stopped');
        clearInterval(this.timer);
        
    }

    private presentTimerToast() {
        let secs = this.timeout ? this.timeout : TIMEOUT;
        let message;
        if(secs > 0 && this.timesup==false) {
            message = 'Dispones de ' + secs + ' segs para confirmar';
        }else{
            message = 'El tiempo para confirmar ha culminado';
        }
        let toast = this.toastCtrl.create({
            message: message,
            duration: 2000,
            position: 'top',
            showCloseButton: true,
            closeButtonText: 'Ok'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }  

    private unlockAndShowTimesupAlert():void {
        this.unlockSending();
        let title = 'Tiempo concluido';
        let message = 'El tiempo disponible para confirmar ha concluido, puedes volver al listado de servicios disponibles y volver a seleccionar'; 
        this.showAlertAndDie(title, message);
    }
}
