import { AuthService } from '../auth-service/auth-service';
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

    constructor(public afDB:AngularFireDatabase,
        private authSrv: AuthService) {
    }

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    /**
     *  READ
     */

    getShipmentsActiveByUser(snapshot:boolean = true) {
        let userId = this.authSrv.fbuser.uid;
        return this.afDB
                .list(DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF, { 
                    preserveSnapshot: snapshot,
                });
    } 

    getShipmentById(shipmentId:string, getSnapshot:boolean = true) {
        return this.afDB
                .object(DB.ALL.REF + shipmentId, {
                    preserveSnapshot: getSnapshot,
                });       
    }
}
