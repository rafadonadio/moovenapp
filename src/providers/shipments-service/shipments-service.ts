import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../auth-service/auth-service';
import { ShipmentsDbService } from './shipments-db-service';
import { Injectable } from '@angular/core';

@Injectable()
export class ShipmentsService {

    constructor(private dbSrv:ShipmentsDbService,
        private authSrv:AuthService,
        private afDb: AngularFireDatabase) {
    }

    getAllActiveObs(snapshot: boolean = false): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userShipments/${accountId}/active`, { preserveSnapshot: snapshot });
    }

    getShipment(id:string) {
        return this.dbSrv.getShipmentById(id);
    }


}
