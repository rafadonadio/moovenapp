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

    shipments:any;
    shipmentsEmpty:boolean;
    shipmentsSuscription:any;

    constructor(private navCtrl: NavController,
        public shipmentsSrv:ShipmentsService,
        public viewCtrl: ViewController) {}

    ngOnInit() {
        console.info('__SHP__shipments');
        this.viewCtrl.willEnter.subscribe( () => {
            console.log('__SHP__willEnter()');
            this.getAllActive();            
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('__SHP__didLeave()');
            this.shipmentsSuscription.unsubscribe();
        });                
    }

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        this.navCtrl.push(ShipmentDetailPage, { 
            shipmentId: data.shipmentId,
            sendingId: data.sendingId,
        });         
    }

    goToCreate() {
        this.navCtrl.setRoot(ShipmentCreatePage);
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
        this.shipmentsSuscription = listRef.subscribe(snapshots => {
                console.log('__SHP__ getAllActive');                
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
