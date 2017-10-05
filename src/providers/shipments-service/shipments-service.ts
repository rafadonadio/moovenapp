import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';

@Injectable()
export class ShipmentsService {

    constructor(private authSrv:AuthService,
        private afDb: AngularFireDatabase) {
    }

    getAllActiveObs(snapshot: boolean = false): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userShipments/${accountId}/active`, { preserveSnapshot: snapshot });
    }

    getObs(shipmentId:string, snapshot:boolean = true): FirebaseObjectObservable<any> {
        return this.afDb.object(`shipments/${shipmentId}`, {
            preserveSnapshot: snapshot,
        });          
    }


}
