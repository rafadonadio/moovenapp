import { LoadingController } from 'ionic-angular';
import { UsersService } from '../../providers/users-service/users-service';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { SendingRequest } from '../../models/sending-model';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController, NavParams, ViewController } from 'ionic-angular';

const NOTIFICATIONS_LIST = SHIPMENT_CFG.NOTIFICATIONS_TO_SHOW;

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage implements OnInit {

    shipmenttab: string = "notifications";
    shipmentId:string;
    sendingId:string;
    senderId:string;    
    sending:SendingRequest;
    shipment:any;
    sender:any;
    shipmentListener:any;
    sendingListener:any;
    senderListener:any;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService,
        public shipmentSrv: ShipmentsService,
        public userSrv: UsersService,
        public viewCtrl: ViewController,
        public loadingCtrl: LoadingController) {
    }

    ngOnInit() {
        console.info('__SHD__shipmentDetail');
        let loader = this.loadingCtrl.create({ content: "Cargando ..." });
        loader.present();           
        this.viewCtrl.willEnter.subscribe( () => {
            console.log('__SHD__willEnter()');
            this.getParams();
            let shipment = this.shipmentSrv.getShipment(this.shipmentId);
            this.shipmentListener = shipment.subscribe(snapshot => {
                this.shipment = snapshot.val();
                loader.dismiss();
            })
            let sending = this.sendingSrv.getSending(this.sendingId);
            this.sendingListener = sending.subscribe(snapshot => {
                this.sending = snapshot.val();
                this.filterAndConvertNotificationsToArray();
                this.userSrv.getAccountProfileDataByUid(this.sending.userUid)
                    .then((snapshot) => {
                        this.sender = snapshot.val();
                    })                
            })
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('__SHD__didLeave()');
            this.shipmentListener.unsubscribe();
            this.sendingListener.unsubscribe();
        });  
    }

    private getParams() {
        console.info('__PRM__  getParams');
        this.shipmentId = this.navParams.get('shipmentId');
        this.sendingId = this.navParams.get('sendingId');
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
                        this.showAlertNotifyAction('cancel');
                    }
                }
            ]
        });
        actionSh.present();
    }

    private filterAndConvertNotificationsToArray() {
        this.notifications = [];
        let notifis = this.sending._notifications;
        let stageStatus:string;
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            stageStatus = notifis[key].currentStage_Status;
            if(NOTIFICATIONS_LIST[stageStatus]===true) {
                //console.log('show notifis > ', stageStatus);
                let item = {
                    key: key,
                    data: notifis[key]
                };
                this.notifications.push(item);
            }
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
                    content.title = 'Retirado';
                    content.message = 'Confirmo que he retirado el servicio';        
                break;
            case 'dropDone':
                    content.set = true;
                    content.title = 'Entregado';
                    content.message = 'Confirmo que he entregado el servicio';                
                break;
            case 'cancel':
                    content.set = true;
                    content.title = 'Servicio interrumpido';
                    content.message = 'Confirmo que interrumpo la continuidad del servicio, dejando el mismo inconcluso.';                
                break;                
        }
        if(content.set) {
            let alert = this.alertCtrl.create({
                title: content.title,
                message: content.message,
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        handler: () => {
                        console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Confirmo',
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
                this.sendingSrv.updateLiveStatusToDroppedAndComplete(this.shipment.shipmentId, this.sending.sendingId)
                    .then((result) => {
                        console.log('runNotifyAction > success', result);
                    })
                    .catch((error) => {
                        console.error('runNotifyAction > failed', error);
                    });
                break;
            case 'cancel':
                //this.sendingSrv.updateLiveStatusToCanceled(this.shipment.shipmentId, this.sending.sendingId);    
                break;
        }

        // if(action=='pickupDone') {
        //     this.sendingSrv.updateLiveStatusToPickedup(
        //                                     this.shipment.shipmentId, 
        //                                     this.sending.sendingId)
        //         .then((result) => {
        //             console.log('runNotifyAction > success', result);
        //         })
        //         .catch((error) => {
        //             console.error('runNotifyAction > failed', error);
        //         });
        // }else if(action=='dropDone') {
        //     this.sendingSrv.updateLiveStatusToDroppedAndComplete(this.shipment.shipmentId, this.sending.sendingId);    
        // }else if(action=='cancel') {
        //     //this.sendingSrv.updateLiveStatusToCanceled(this.shipment.shipmentId, this.sending.sendingId);    
        // } 
    }

}
