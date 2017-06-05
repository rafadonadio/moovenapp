import { SendingSetDroppedService } from './sending-set-dropped-service';
import { SendingSetPickedupService } from './sending-set-pickedup-service';
import { SendingSetGotoperatorService } from './sending-set-gotoperator-service';
import { SendingCreateService } from './sending-create-service';
import { FirebaseListObservable } from 'angularfire2/database';
import { SendingPaymentService } from './sending-payment-service';
import { SendingNotificationsService } from './sending-notifications-service';
import { UserAccountSettings } from '../../models/user-model';
import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { HashService } from '../hash-service/hash-service';
import { SendingRequest } from '../../models/sending-model';

import firebase from 'firebase';

@Injectable()
export class SendingService {

    user: firebase.User;
    userSettings: UserAccountSettings;

    constructor(public users: UsersService,
        public hashSrv: HashService,
        public reqSrv: SendingRequestService,
        public dbSrv: SendingDbService,
        public notificationsSrv:SendingNotificationsService,
        public paySrv: SendingPaymentService,
        private createSrv: SendingCreateService,
        private setGotoperSrv: SendingSetGotoperatorService,
        private setPickSrv: SendingSetPickedupService,
        private setDropSrv: SendingSetDroppedService) {
        this.setUser();
    }

    /**
     * Init sending data object
     * @return {object} [description]
     */
    initObj() {
        return this.createSrv.new();
    }

    create(sending:SendingRequest): Promise<any> {
        return this.createSrv.run(sending, this.user.uid);
    }

    setOperator(sendingId:string) {
        return this.setGotoperSrv.run(sendingId, this.user.uid);
    }

    setPickedup(sendingId:string) {
        return this.setPickSrv.run(sendingId, this.user.uid);
    }

    setDropped(sendingId:string) {
        return this.setDropSrv.run(sendingId, this.user.uid);
    }    

    /**
     * Get REF of All sendings from current user
     * @return firebase snapshots
     */
    getAllMyActiveRef() {
        return this.getMyLiveSendingsRef();
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
        let userId = this.user.uid;
        return this.dbSrv.attemptToLockSendingLiveVacant(sendingId, userId);
    }

    // **********



    /**
     *  DATABASE READ
     */

    private getMyLiveSendingsRef():any {
        //console.log('__SNDSRV__ userId', this.user.uid);
        return this.dbSrv.getSendingsLiveByUser(this.user.uid);
    }

    private getAllLiveVacantRef():firebase.database.Query  {
        return this.dbSrv.getSendingsLiveVacantRef();
    }      

    private getAllLiveVacant():FirebaseListObservable<any>  {
        return this.dbSrv.getSendingsLiveVacant(this.user.uid);
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

    /**
     *  HELPERS
     */

    setUser(){
        // set user data
        this.user = this.users.getUser();
        // set user settings
        this.users.getAccountSettings()
            .then((snapshot) => {
                this.userSettings = snapshot.val();
            }); 
    }

}
