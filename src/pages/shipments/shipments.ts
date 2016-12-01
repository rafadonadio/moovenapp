import { SendingService } from '../../providers/sending-service/sending-service';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

@Component({
    selector: 'page-shipments',
    templateUrl: 'shipments.html',
})
export class ShipmentsPage implements OnInit{

    shipments:any;
    shipmentsEmpty:boolean;

    constructor(private navCtrl: NavController,
        public shipmentsSrv:ShipmentsService,
        public sendingsSrv:SendingService) {

    }

    ngOnInit() {
        this.getAllActive();
    }

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        let service = this.sendingsSrv.getSending(data.sendingId);
        service.subscribe(snapshot => {
            console.log('getSending > success');
            this.navCtrl.push(ShipmentDetailPage, { 
                sending: snapshot.val(),
                shipment: data 
            });
        });         
    }

    goToCreate() {
        this.navCtrl.setRoot(ShipmentCreatePage);
    }

    doRefresh(refresher) {
        this.getAllActive();
        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }    

    getStatusMessage(currentStageStatus) {
        let message = '';
        switch(currentStageStatus){
            case 'live_gotoperator':
            case 'live_waitpickup':
                message = 'Retirar';
                break;
            case 'live_pickedup':                
            case 'live_inroute':
                message = 'Entregar';
                break;                
            case 'live_dropped':
            case 'closed_completed':
                message = 'Entregado';
                break;                             
        }
        return message;
    }

    /**
     *  PRIVATE
     */

    private getAllActive() {
        let listRef = this.shipmentsSrv.getAllMyActiveRef();
        listRef
            .subscribe(snapshots => {
                console.log('shipments > getAllActive > subscribe > init');                
                this.shipments = [];
                if(snapshots) {
                    snapshots.forEach(snapshot => {
                        let key = snapshot.key;
                        let item = {
                            key: key,
                            data: snapshot.val(),
                        };
                        this.shipments.push(item); 
                    });
                }
                if(this.shipments.length > 0) {
                    this.shipmentsEmpty = false;
                }else{
                    this.shipmentsEmpty = true;
                }
            });
    }
}
