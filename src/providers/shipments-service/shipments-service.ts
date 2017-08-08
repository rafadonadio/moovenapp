import { HashService } from '../hash-service/hash-service';
import { ShipmentsDbService } from './shipments-db-service';
import { Injectable } from '@angular/core';

@Injectable()
export class ShipmentsService {

    constructor(public dbSrv:ShipmentsDbService,
        public hashSrv:HashService) {
    }

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
        return this.dbSrv.getShipmentsActiveByUser();
    }

    private getShipmentById(shipmentId:string) {
        return this.dbSrv.getShipmentById(shipmentId);
    }


}
