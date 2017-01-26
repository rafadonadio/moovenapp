import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { SendingService } from '../../providers/sending-service/sending-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';

import { SendingsPage } from '../sendings/sendings';

@Component({
    selector: 'page-sending-detail-checkout',
    templateUrl: 'sending-detail-checkout.html',
})

export class SendingDetailCheckoutPage implements OnInit {

    sending: any;
    map: any;
    routeDetails: any;   
    sendingPayed:boolean = false;    

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendings: SendingService,
        public gmapsSrv: GoogleMapsService) {
    }

    ngOnInit() {
        console.log('sending checkout > init');
        // get sending data
        this.sending = this.navParams.get('sending');
        console.info('navParams > ', this.sending);
        // calculate distance
        this.initMap();
        this.initRouteDetails();
        this.getRoute();
    }

    /** 
     *  MAIN ACTIONS
     */

    runPayment() {
        let alert = this.alertCtrl.create({
            title: 'Pago',
            message: 'Proceder con el el pago de $' + this.sending.price + ' para confirmar el servicio.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > submit > confirm > canceled');
                    }
                },
                {
                    text: 'Pagar',
                    handler: () => {
                        console.log('f4 > submit > confirm > process');
                        this.paySending();
                    }
                }
            ]
        });
        alert.present();        
    }

    cancelSending() {
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Envío?',
            message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('f4 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    goToSendings() {
        let alert = this.alertCtrl.create({
            title: 'Volver al listado?',
            message: 'El servicio esta creado y puedes finalizar el pago luego, hasta una hora antes de la hora de retiro.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si, volver',
                    handler: () => {
                        console.log('f4 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }    

    /**
     *  NAVIGATION
     */

    private presentToast() {
        let toast = this.toastCtrl.create({
            message: 'Tu envío fue creado!',
            duration: 3000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('f4 > toast > dismissed');
        });

        toast.present();
    }

    /**
     *  DATA
     */

    private paySending() {
        console.info('paySending > start');
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'procesando pago ...',
        });
        loader.present();
        // pay
        this.sendings.pay(this.sending.sendingId)
            .then((result) => {
                console.log('payment ok', result);
                this.sendingPayed = true;
                loader.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(SendingsPage);
                        this.presentToast();
                    });
            })
            .catch((error) => {
                console.log('f4 > payment sending > error', error);
                loader.dismiss()
                    .then(() => {
                        let alertError = this.alertCtrl.create({
                            title: 'Error con el pago',
                            subTitle: 'Ocurrió un error al procesar el pago, por favor intenta nuevamente.',
                            buttons: [{
                                text: 'Cerrar',
                                role: 'cancel'
                            }]
                        });
                        // show
                        alertError.present();
                    });
            });        
    }

    private getRoute() {
        console.info('f4 > getRoute > init');
        // latlng
        let origin = this.gmapsSrv.setlatLng(this.sending.pickupAddressLat, this.sending.pickupAddressLng);
        let destination = this.gmapsSrv.setlatLng(this.sending.dropAddressLat, this.sending.dropAddressLng);
        // display map
        let directionsDisplay = this.gmapsSrv.getDirectionsRenderer();
        directionsDisplay.setMap(this.map);
        // get
        this.gmapsSrv.getRouteDirections(origin, destination)
            .then((response) => {
                if(response.status === 'OK'){
                    console.log('f4 > getRoute success > ', response);
                    // show directions in map
                    directionsDisplay.setDirections(response);
                    // get routeDetails
                    this.routeDetails = this.gmapsSrv.inspectRouteDetails(response);
                }else{
                    console.error('f4 > getRoute > response error > ', response.status);
                }
            })
            .catch((error) => {
                console.error('f4 > getRoute > error > ', error);
            });        
    }

    /**
     *  INIT 
     */


    private initRouteDetails() {
        this.routeDetails = this.gmapsSrv.initRouteDetails();
    }

    private initMap() {
        console.info('f4 > initMap');
        let latlng = this.gmapsSrv.setlatLng(-34.603684, -58.381559);
        let divMap = (<HTMLInputElement>document.getElementById('mapf4'));
        this.map = this.gmapsSrv.initMap(latlng, divMap);
    }  

}
