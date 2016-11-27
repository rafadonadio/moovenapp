import { ShipmentCreatePage } from '../shipment-create/shipment-create';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Component, OnInit } from '@angular/core';
import { Alert, NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';

const TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT;

@Component({
    selector: 'page-shipment-create-2',
    templateUrl: 'shipment-create-2.html',
})
export class ShipmentCreate2Page implements OnInit {

    timerSubscription:any;
    timeout:number;
    timesup:boolean;
    confirmAlert:Alert;
    confirmAlertOpen: boolean;

    constructor(public navCtrl: NavController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController) {

    }

    ngOnInit() {
        this.timer();
        this.initConfirmAlert();
    }

    createShipment() {
        this.showConfirm();
    }

    showConfirm() {
        this.confirmAlert.present();
        this.confirmAlertOpen = true;
    }

    showTimerToast() {
        this.presentTimerToast();
    }

    cancel() {
        this.navCtrl.setRoot(ShipmentCreatePage);
    }

    private timer() {
        // init 
        this.timesup = false;
        let timer = TimerObservable.create(0, 1000);
        this.timerSubscription = timer.subscribe((t) => {
            console.log(t);
            this.timeout = TIMEOUT - t;
            if(t>=TIMEOUT) {
                this.timerSubscription.unsubscribe();
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
        });
        this.showTimerToast();
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
                        this.navCtrl.setRoot(ShipmentsPage);
                        this.presentSuccessToast();
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
                        this.navCtrl.setRoot(ShipmentsPage);
                    }
                }
            ]
        });
        alert.present();
    }


}
