import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { SendingService } from '../../providers/sending-service/sending-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';

import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate2Page } from '../sending-create-2/sending-create-2';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';

@Component({
    selector: 'page-sending-create-4',
    templateUrl: 'sending-create-4.html',
})
export class SendingCreate4Page implements OnInit {

    sending: any;
    map: any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendings: SendingService,
        public gmapsSrv: GoogleMapsService) {
    }

    ngOnInit() {
        console.log('f4 > init');
        // get sending data
        this.getSendingFromParams();
        // calculate distance
        this.initMap();
        this.getRoute();
        // get price
    }

    /** 
     *  MAIN ACTIONS
     */

    goBack(step: number): void {
        this.goBackToStep(step);
    }

    submit() {
        let alert = this.alertCtrl.create({
            title: 'Confirmar envío',
            message: 'Se debitarán $79,00 de tu cuenta y tu envío será confirmado',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > submit > confirm > canceled');
                    }
                },
                {
                    text: 'Confirmar y Pagar',
                    handler: () => {
                        console.log('f4 > submit > confirm > process');
                        this.createSending();
                    }
                }
            ]
        });
        alert.present();
    }

    cancel() {
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

    /**
     *  NAVIGATION
     */

    private goBackToStep(step: number) {
        console.log('f4 > go to f' + step + ', include this.sending in params');
        let page: any;
        switch (step) {
            case 1:
                page = SendingCreatePage;
                break;
            case 2:
                page = SendingCreate2Page;
                break;
            case 3:
                page = SendingCreate3Page;
                break;
        }
        this.navCtrl.setRoot(page, {
            sending: this.sending
        });
    }

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

    private createSending() {
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'creando ...'
        });
        loader.present();
        // save to db
        this.sendings.create(this.sending)
            .then(() => {
                console.log('f4 > create sending > success');
                loader.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(SendingsPage);
                        this.presentToast();
                    });
            })
            .catch((error) => {
                console.log('f4 > create sending > error', error.code);
                loader.dismiss()
                    .then(() => {
                        let alertError = this.alertCtrl.create({
                            title: 'Ocurrió un error',
                            subTitle: 'Ocurrió un error al intentar guardar el envío, por favor intenta nuevamente.',
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
                console.log('f4 > getRoute success > ', response);
                directionsDisplay.setDirections(response);
            })
            .catch((error) => {
                console.error('f4 > getRoute > error > ', error);
            });        
    }

    private setDistance(response: any) {
        console.log('f4 > setDistance > response > ', response);
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;
        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                if(element.status == 'OK') {
                    console.info('setDistance result > element.status > OK ');
                    var distance = element.distance.text;
                    var duration = element.duration.text;
                    var from = origins[i];
                    var to = destinations[j];
                    console.info('setDistance result ', i, ' > ', element, distance, duration, from, to);
                }else{
                    console.info('setDistance result > element.status > error ', element.status);
                }    
            }
        }
    }

    /**
     *  INIT 
     */

    private getSendingFromParams() {
        console.log('f4 > get navParams > this.sending');
        console.log('f4 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

    private initMap() {
        console.info('f4 > initMap');
        let latlng = this.gmapsSrv.setlatLng(-34.603684, -58.381559);
        let divMap = (<HTMLInputElement>document.getElementById('mapf4'));
        this.map = this.gmapsSrv.initMap(latlng, divMap);
    }  

}
