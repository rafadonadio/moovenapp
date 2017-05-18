import { PriceService } from '../../providers/price-service/price-service';
import { CheckoutPage } from '../checkout/checkout';
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
    routeDetails: any;
    price = {
        value: 0,
        applyMinFare: false,
        items: [],
        processedKms: 0
    };
    // when created
    sendingId:string;    
    sendingCreated:boolean = false;
    sendingPayed:boolean = false;    

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendingSrv: SendingService,
        public gmapsSrv: GoogleMapsService,
        public priceSrv: PriceService) {
    }

    ngOnInit() {
        console.log('f4 > init');
        // get sending data
        this.getSendingFromParams();
        // calculate distance
        this.initMap();
        this.initRouteDetails();
        this.getRoute();
    }

    /** 
     *  MAIN ACTIONS
     */

    goBack(step: number): void {
        this.goBackToStep(step);
    }

    runCreate() {
        let alert = this.alertCtrl.create({
            title: 'Nuevo Servicio',
            message: 'Confirmo que los datos ingresados estan correctos y deseo crear un nuevo servicio',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > submit > confirm > canceled');
                    }
                },
                {
                    text: 'Confirmar',
                    handler: () => {
                        console.log('f4 > submit > confirm > process');
                        this.createSending();
                    }
                }
            ]
        });
        alert.present();
    }

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
                        console.log('f4 > goTo Checkout');
                        this.navCtrl.push(CheckoutPage, { sending: this.sending });
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

    /**
     *  DATA
     */

    private createSending() {
        console.info('f4 > createSending > start');
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'registrando servicio ...',
        });
        loader.present();
        // save to db
        this.sendingSrv.register(this.sending)
            .then((result) => {
                console.log('create success > steps ', result);
                this.sendingId = result.sendingId;
                this.sendingCreated= true;
                loader.dismiss()
                    .then(() => {
                        this.runPayment();
                    });
            })
            .catch((error) => {
                console.log('f4 > create sending > error', error);
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
                if(response.status === 'OK'){
                    console.log('f4 > getRoute success > ', response);
                    // show directions in map
                    directionsDisplay.setDirections(response);
                    // get routeDetails
                    this.routeDetails = this.gmapsSrv.inspectRouteDetails(response);
                    // set price
                    this.setPrice();
                    // update sending
                    this.updateSendingPrice();
                    this.updateSendingRoute();
                }else{
                    console.error('f4 > getRoute > response error > ', response.status);
                }
            })
            .catch((error) => {
                console.error('f4 > getRoute > error > ', error);
            });        
    }

    /**
     * Sending
     */

    private setPrice():void {
        console.log('setSendingPrice > ', this.routeDetails.totalDistance.kms);
        this.price = this.priceSrv.setSendingPrice(this.routeDetails.totalDistance.kms);
    }

    private updateSendingPrice() {
        this.sending.price = this.price.value;
        this.sending.priceMinFareApplied = this.price.applyMinFare; 
        this.sending.priceItems = this.price.items;
    }

    private updateSendingRoute() {
        this.sending.routeDistanceMt = this.routeDetails.totalDistance.meters;
        this.sending.routeDistanceKm = this.routeDetails.totalDistance.kms;
        this.sending.routeDistanceTxt = this.routeDetails.totalDistance.text;
        this.sending.routeDurationMin = this.routeDetails.totalDuration.min;
        this.sending.routeDurationTxt = this.routeDetails.totalDuration.text;               
    }


    /**
     *  INIT 
     */

    private getSendingFromParams() {
        console.log('f4 > get navParams > this.sending');
        console.log('f4 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

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
