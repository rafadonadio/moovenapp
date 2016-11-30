import { SHIPMENT_DB, ShipmentRequest } from '../../models/shipment-model';
import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

const DB = SHIPMENT_DB;

@Injectable()
export class ShipmentsDbService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: firebase.database.Reference = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    newSendingKey():any {
        return this.dbRef.child(DB.ALL.REF).push().key;
    }

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    newShipment(shipment:ShipmentRequest, newKey:string, userid:string):firebase.Promise<any> {  
        console.log('dbSrv > newShipment > start'); 
        // update refs array
        let updates = {};
        // set sendingId
        shipment.shipmentId = newKey;
        // sending full object
        updates[DB.ALL.REF + newKey] = shipment;        
        // sending publicId hash reference 
        updates[DB.HASHID.REF + shipment.publicId] = newKey;
        // operator shipment reference
        updates[DB.BYUSER.REF + userid] = shipment;
        // update and return promise
        return this.dbRef.update(updates);
    }


}
