import { SHIPMENT_DB } from '../../models/shipment-model';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

import firebase from 'firebase';

const DB = SHIPMENT_DB;

@Injectable()
export class ShipmentsDbService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: firebase.database.Reference = firebase.database().ref();

    constructor(public afDB:AngularFireDatabase) {
    }

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    /**
     *  READ
     */

    getShipmentsActiveByUser(userid:string, getSnapshot:boolean = true) {
        return this.afDB
                .list(DB.BYUSER.REF + userid + DB.BYUSER._CHILD.ACTIVE.REF, { 
                    preserveSnapshot: getSnapshot,
                });
    } 

    getShipmentById(shipmentId:string, getSnapshot:boolean = true) {
        return this.afDB
                .object(DB.ALL.REF + shipmentId, {
                    preserveSnapshot: getSnapshot,
                });       
    }
}
