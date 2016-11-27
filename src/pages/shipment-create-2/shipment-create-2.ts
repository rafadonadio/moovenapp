import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { Alert, NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

const TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT;

@Component({
    selector: 'page-shipment-create-2',
    templateUrl: 'shipment-create-2.html',
})
export class ShipmentCreate2Page implements OnInit {

    timer:any;
    timeout:number;
    timesup:boolean;
    confirmAlert:Alert;
    confirmAlertOpen: boolean;
    confirmInProcess: boolean;
    confirmCanceled: boolean;

    constructor(public navCtrl: NavController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController) {
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
        this.navCtrl.setRoot(ShipmentCreatePage);
    }

    private initTimer() {
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
                if(this.confirmAlertOpen) {
                    this.confirmAlert.dismiss()
                        .then(() => {
                            this.showTimesupAlert();
                        })
                }else{
                    this.showTimesupAlert();
                }
            } 
        }, 1000)

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
        this.confirmInProcess = false;
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
                        this.confirmInProcess = false;
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

    private showTimesupAlert():void {
        let alert = this.alertCtrl.create({
            title: 'Tiempo concluido',
            message: 'El tiempo disponible para confirmar ha concluido, puedes volver al listado de servicios disponibles y volver a seleccionar',
            buttons: [
                {
                    text: 'Volver',
                    handler: () => {
                        this.navCtrl.setRoot(ShipmentCreatePage);
                    }
                }
            ]
        });
        if(this.confirmInProcess==false) {
            alert.present();
        }    
    }

    private confirm() {
        this.stopTimer();
        this.confirmInProcess = true;
        let loading = this.loadingCtrl.create({
            content: 'Confirmando servicio ...'
        });
        loading.present();
        setTimeout(() => {
            loading.dismiss();
        }, 3000);
        // process
        loading.onDidDismiss(() => {
            console.log('Dismissed loading');
            this.navCtrl.setRoot(ShipmentsPage);
            this.presentSuccessToast();
        });
    }

}
