import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage implements OnInit{

    shipmenttab: string = "notifications";
    sending:any;
    shipment:any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        this.shipment = this.navParams.get('shipment');
    }

    goToTab(tab: string) {
        this.shipmenttab = tab;
    }

    openActionSh() {
        let actionSh = this.actionShCtrl.create({
            title: 'Confirmar Avances',
            buttons: [
                {
                    text: 'Retirado',
                    icon: 'home',
                    handler: () => {
                        console.log('informar retiro');
                    }
                },
                {
                    text: 'Entregado',
                    icon: 'pin',
                    handler: () => {
                        console.log('informar entrega');
                    }
                },
                {
                    text: 'Otro',
                    icon: 'sad',
                    handler: () => {
                        console.log('otro');
                    }
                }
            ]
        });
        actionSh.present();
    }
}
