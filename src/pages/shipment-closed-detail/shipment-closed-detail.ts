import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { LoadingController } from 'ionic-angular';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { SendingRequest } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController, NavParams, ViewController } from 'ionic-angular';


@Component({
    selector: 'page-shipment-closed-detail',  
    templateUrl: 'shipment-closed-detail.html',
})
export class ShipmentClosedDetailPage implements OnInit {

    shipmenttab: string = "notifications";
    shipmentId:string;
    sendingId:string;
    senderId:string;    
    sending:SendingRequest;
    shipment:any;
    sender:any;
    shipmentSubs:any;
    sendingSubs:Subscription;
    senderSubs:Subscription;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService,
        public shipmentSrv: ShipmentsService,
        public viewCtrl: ViewController,
        public loadingCtrl: LoadingController,
        private accountSrv: AccountService) {
    }

    ngOnInit() {

    }

    ionViewWillEnter() {
        console.info('get params');
        this.shipmentId = this.navParams.get('shipmentId');
        this.sendingId = this.navParams.get('sendingId');
        // get shipment/sending 
        let loader = this.loadingCtrl.create({ content: "Cargando ..." });     
        let shObs = this.shipmentSrv.getObs(this.shipmentId);
        this.shipmentSubs = shObs.subscribe(snapshot => {
            this.shipment = snapshot.val();
            loader.dismiss();
        })
        let obs = this.sendingSrv.getByIdObs(this.sendingId, true);
        this.sendingSubs = obs.subscribe(snapshot => {
            this.sending = snapshot.val();
            this.setNotificationsAsArray();
            let obs = this.accountSrv.getObs(true);
            this.senderSubs = obs.subscribe((snap) => {
                    let account = snap.val();
                    this.sender = account.profile.data;
                });                
        });           
    }    

    ionViewWillLeave() {
        console.log('__SHD__didLeave()');
        if(this.shipmentSubs){
            this.shipmentSubs.unsubscribe();
        }
        if(this.sendingSubs) {
            this.sendingSubs.unsubscribe();
        }
        this.sending = null;
        this.shipment = null;
    }

    goToTab(tab: string) {
        this.shipmenttab = tab;
    }

    openActionSh() {
        let actionSh = this.actionShCtrl.create({
            title: 'Notificar ',
            buttons: [
                {
                    text: 'Interrumpir servicio',
                    icon: 'close',
                    handler: () => {
                        actionSh.dismiss()
                            .then(() => {
                                this.showAlertNotifyAction('cancelService');
                            })
                            .catch(err => console.log(err));
                            return false;
                    }
                }
            ]
        });
        actionSh.present();
    }


    private setNotificationsAsArray() {
        this.notifications = [];
        let notifis = this.shipment._notifications || [];
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            let item = {
                key: key,
                data: notifis[key]
            };
            this.notifications.push(item);
        }
        //console.log(this.notifications);
    }

    private showAlertNotifyAction(action:string) {
        let content = {
            set: false,
            title: '',
            message: '',
        }
        switch(action) {
            case 'pickupDone':
                    content.set = true;
                    content.title = 'Servicio Retirado';
                    content.message = 'Confirmo que he retirado el servicio';        
                break;
            case 'dropDone':
                    content.set = true;
                    content.title = 'Servicio Entregado';
                    content.message = 'Confirmo que he entregado el servicio';                
                break;
            case 'cancelService':
                    content.set = true;
                    content.title = 'Seguro deseas interrumpir el Servicio?';
                    content.message = 'El Servicio se registrará como interrumpido e inconcluso. Por favor comunicate directamente con el usuario del Servicio para notificarlo.';                
                break;                
        }
        if(content.set) {
            let alert = this.alertCtrl.create({
                title: content.title,
                message: content.message,
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Sí, confirmo',
                        handler: () => {
                            this.runNotifyAction(action);
                        }
                    }
                ]
            });
            alert.present();
        }else{
            console.error('AlertController action param invalid');
        }

    }

    private runNotifyAction(action:string):void {      
        switch(action) {

            case 'pickupDone':
                this.sendingSrv.setPickedup(this.sending.sendingId)
                    .then((result) => {
                        console.log('runNotifyAction > success', result);
                    })
                    .catch((error) => {
                        console.error('runNotifyAction > failed', error);
                    });
                break;

            case 'dropDone':
                this.sendingSrv.setDropped(this.sending.sendingId)
                    .then((result) => {
                        console.log('runNotifyAction > success', result);
                    })
                    .catch((error) => {
                        console.error('runNotifyAction > failed', error);
                    });
                break;

            case 'cancelService':
                let loading = this.loadingCtrl.create({ content: 'cancelando ...'});
                this.sendingSrv.setCanceledbyoperator(this.sending.sendingId)
                    .then(() => {
                        console.log('service canceled ok');
                        let alert = this.alertCtrl.create({
                            title: 'Cancelación en proceso',
                            subTitle: 'La cancelación del servicio se ha iniciado correctamente.',
                            buttons: ['Cerrar']
                        });
                        loading.dismiss()
                            .then(() => {
                                console.log('loading dismissed');
                                alert.present();
                                return alert.onDidDismiss(() => {
                                    console.log('alert dismissed');
                                    this.navCtrl.pop();
                                });
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => {
                        console.log('sending canceled error', err.error);
                        let alert = this.alertCtrl.create({
                            title: 'Error',
                            subTitle: 'Ocurrió un error, no se pudo iniciar la cancelación del servicio, vuelve a intentarlo.',
                            buttons: ['Cerrar']
                        });
                        loading.dismiss()
                            .then(() => {
                                alert.present();
                            })
                            .catch(err => console.log(err));
                    });                
                break;
        }

    }

}
