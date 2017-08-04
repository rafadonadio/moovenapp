import { UsersService } from '../../providers/users-service/users-service';
import { UserAccount } from '../../models/user-model';
import { SendingsPage } from '../sendings/sendings';
import { AlertController } from 'ionic-angular';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

@Component({
    selector: 'page-shipments',
    templateUrl: 'shipments.html',
})
export class ShipmentsPage implements OnInit{

    // operatorAuth flags
    operatorAuth:any;
    // list
    shipments:any;
    shipmentsEmpty:boolean;
    // list observer
    shipmentsSuscription:any;  

    constructor(private navCtrl: NavController,
        public shipmentsSrv:ShipmentsService,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public users: UsersService) {}

    ngOnInit() {
        console.info('__shipment__');
        this.initOperatorAuth();    
    }



    /**
     *  PRIVATE
     */


    private setOperatorAuth() {

    }

    private initOperatorAuth() {
        this.operatorAuth = {
            unchecked: true,
            enabled: false,
            active: false
        }
    }



}
