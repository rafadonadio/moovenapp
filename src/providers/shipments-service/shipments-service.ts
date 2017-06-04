import { SendingRequest } from '../../models/sending-model';
import { HashService } from '../hash-service/hash-service';
import { UsersService } from '../users-service/users-service';
import { ShipmentsDbService } from './shipments-db-service';
import { SHIPMENT_CFG }  from '../../models/shipment-model';
import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class ShipmentsService {

    user: firebase.User;

    constructor(public dbSrv:ShipmentsDbService,
        public users:UsersService,
        public hashSrv:HashService) {
        this.setUser();
    }

    create(sending:SendingRequest):Promise<any> {
        console.info('shipment create() > param', sending);
        // get a new db key 
        let newKey = this.dbSrv.newSendingKey();
        /* populate */
        let shipment:any = {};
        shipment.shipmentId = newKey;
        shipment.publicId = this.hashSrv.genId();
        shipment.userUid = this.user.uid;
        shipment.sendingId = sending.sendingId;
        shipment.sendingPublicId = sending.publicId;
        shipment.summary = this.getSummary(sending);
        shipment._currentStage_Status = sending._currentStage_Status;
        shipment._active = true;
        shipment.timestamp = this.dbSrv.getTimestamp();

        return new Promise((resolve, reject) => {
            this.dbSrv.newShipment(shipment, newKey, this.user.uid)
                .then(() => {
                    console.log('newShipment > success');
                    resolve();
                })
                .catch((error) => {
                    console.error('newShipment > error',  error);
                    reject(error);
                });
        })


    }

    /**
     * Get REF of All sendings from current user
     * @return firebase snapshots
     */
    getAllMyActiveRef() {
        return this.getMyLiveShipmentsRef();
    }

    getShipment(id:string) {
        return this.getShipmentById(id);
    }

    /**
     *  DATABASE READ
     */

    private getMyLiveShipmentsRef():any {
        return this.dbSrv.getShipmentsActiveByUser(this.user.uid);
    }

    private getShipmentById(shipmentId:string) {
        return this.dbSrv.getShipmentById(shipmentId);
    }

    /**
     *  HELPERS
     */

    private getSummary(sending:SendingRequest) {
        let summary:any = {}; 
        let fieldsList = SHIPMENT_CFG.SUMMARY_FIELDS;
        // iterate fields
        for(let index in fieldsList) {
            let field = fieldsList[index];
            summary[field] = sending[field];
        }
        return summary;        
    }

    private setUser(){
        this.user = this.users.getUser();
    }

}
