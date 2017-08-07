import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AuthService } from '../auth-service/auth-service';
import { SendingSetDroppedService } from './sending-set-dropped-service';
import { SendingSetPickedupService } from './sending-set-pickedup-service';
import { SendingSetGotoperatorService } from './sending-set-gotoperator-service';
import { SendingCreateService } from './sending-create-service';
import { FirebaseListObservable } from 'angularfire2/database';
import { SendingPaymentService } from './sending-payment-service';
import { SendingNotificationsService } from './sending-notifications-service';
import { Injectable } from '@angular/core';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { HashService } from '../hash-service/hash-service';
import { SendingRequest } from '../../models/sending-model';

import firebase from 'firebase';

@Injectable()
export class SendingService {

    constructor(public hashSrv: HashService,
        public reqSrv: SendingRequestService,
        public dbSrv: SendingDbService,
        public notificationsSrv:SendingNotificationsService,
        public paySrv: SendingPaymentService,
        private createSrv: SendingCreateService,
        private setGotoperSrv: SendingSetGotoperatorService,
        private setPickSrv: SendingSetPickedupService,
        private setDropSrv: SendingSetDroppedService,
        private authSrv: AuthService,
        private afDb: AngularFireDatabase) {}


    /**
     * Create / Update
    */

    initObj() {
        return this.createSrv.new();
    }

    create(sending:SendingRequest): Promise<any> {
        return this.createSrv.run(sending, this.authSrv.fbuser.uid);
    }

    setOperator(sendingId:string) {
        return this.setGotoperSrv.run(sendingId, this.authSrv.fbuser.uid);
    }

    setPickedup(sendingId:string) {
        return this.setPickSrv.run(sendingId, this.authSrv.fbuser.uid);
    }

    setDropped(sendingId:string) {
        return this.setDropSrv.run(sendingId, this.authSrv.fbuser.uid);
    }    


    /**
     *  READ
     */

    // get account active sendings Observable
    getAllActiveObs(snapshot:boolean = false): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userSendings/${accountId}/active`, { preserveSnapshot: snapshot });
    } 

    getByIdObs(sendingId:string, snapshot:boolean = false) {
        return this.afDb.object(`sendings/${sendingId}`,  { preserveSnapshot: snapshot });
    }



    getSending(id:string) {
        return this.getSendingById(id);
    }

    /**
     *  SendingLiveVacants
     */

    getLiveVacantRef():firebase.database.Query {
        return this.getAllLiveVacantRef();
    }

    getLiveVacant():FirebaseListObservable<any> {
        return this.getAllLiveVacant();
    }

    attemptToLockVacant(sendingId:string):Promise<any> {
        return this.attemptToLockLiveVacantSending(sendingId);
    }

    unlockVacant(sendingId:string): firebase.Promise<any> {
        return this.dbSrv.unlockSendingLiveVacant(sendingId);
    }

    // attempt to lock sending before confirm sending to shipper
    private attemptToLockLiveVacantSending(sendingId:string):Promise<any> {
        let userId = this.authSrv.fbuser.uid;
        return this.dbSrv.attemptToLockSendingLiveVacant(sendingId, userId);
    }

    // **********



    /**
     *  DATABASE READ
     */

    private getAllLiveVacantRef():firebase.database.Query  {
        return this.dbSrv.getSendingsLiveVacantRef();
    }      

    private getAllLiveVacant():FirebaseListObservable<any>  {
        return this.dbSrv.getSendingsLiveVacant(this.authSrv.fbuser.uid);
    }

    private getSendingById(sendingId:string) {
        return this.dbSrv.getSendingById(sendingId);
    }

     /**
     *  NOTIFICATIONS
     */

    // send notifications to user, based on setttings
    sendNotifications(sendingId:string, contentLog:any):void {
        this.notificationsSrv.sendLocalNotification(sendingId, contentLog);
    }


}
