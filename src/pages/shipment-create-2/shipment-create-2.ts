import { SHIPMENT_CFG } from '../../models/shipment-model';
import { TimerObservable } from 'rxjs/observable/TimerObservable';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';

const TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT;

@Component({
    selector: 'page-shipment-create-2',
    templateUrl: 'shipment-create-2.html',
})
export class ShipmentCreate2Page implements OnInit {

    timeout: number;
    timesup:boolean;
    timerSubscription:any;
    confirmAlert:any;

    constructor(public navCtrl: NavController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController) {

    }

    ngOnInit() {
        this.startTimer();
    }

    createShipment() {
        this.showConfirm();
    }

    showConfirm() {
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
                        this.presentToast();
                    }
                }
            ]
        });
        this.confirmAlert.present();
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: 'Tienes una nueva carga!',
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
    }

    private startTimer() {
        // init 
        this.timesup = false;
        let timer = TimerObservable.create(0, 1000);
        this.timerSubscription = timer.subscribe((t) => {
            console.log(t);
            this.timeout = TIMEOUT - t;
            if(t>=TIMEOUT) {
                this.timerSubscription.unsubscribe();
                this.timesup = true;
            } 
        });
        this.presentTimerToast();
    }

    presentTimerToast() {
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

}
