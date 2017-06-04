import { HashService } from '../hash-service/hash-service';
import { UsersService } from '../users-service/users-service';
import { ShipmentsDbService } from './shipments-db-service';
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

    private setUser(){
        this.user = this.users.getUser();
    }

}
