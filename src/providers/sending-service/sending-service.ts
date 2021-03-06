import { SendingSetCanceledbyoperatorService } from './sending-set-canceledbyoperator-service';
import { SendingSetCanceledbysenderService } from './sending-set-canceledbysender-service';
import { DATE_DEFAULTS, DateService } from '../date-service/date-service';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { AuthService } from '../auth-service/auth-service';
import { SendingSetDroppedService } from './sending-set-dropped-service';
import { SendingSetPickedupService } from './sending-set-pickedup-service';
import { SendingSetGotoperatorService } from './sending-set-gotoperator-service';
import { SendingCreateService } from './sending-create-service';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';
import { SendingPaymentService } from './sending-payment-service';
import { SendingNotificationsService } from './sending-notifications-service';
import { Injectable } from '@angular/core';
import { HashService } from '../hash-service/hash-service';
import { SendingRequest, SendingRequestLiveSummary } from '../../models/sending-model';
import { SHIPMENT_CFG } from '../../models/shipment-model';

import * as GeoFire from 'geofire';
import * as firebase from 'firebase';

const VACANT_LOCK_TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT + SHIPMENT_CFG.WAIT_AFTER_UNLOCK; // ADDED SECONDS TO AVOID COLISSIONS
const PICKUP_DIFF_DAYS = DATE_DEFAULTS.PICKUP_DIFF_DAYS;

@Injectable()
export class SendingService {

    dbRef = firebase.database().ref();

    constructor(public hashSrv: HashService,
        public notificationsSrv:SendingNotificationsService,
        public paySrv: SendingPaymentService,
        private createSrv: SendingCreateService,
        private setGotoperSrv: SendingSetGotoperatorService,
        private setPickSrv: SendingSetPickedupService,
        private setDropSrv: SendingSetDroppedService,
        private setCanceledUsr: SendingSetCanceledbysenderService,
        private setCanceledOpr: SendingSetCanceledbyoperatorService,
        private authSrv: AuthService,
        private afDb: AngularFireDatabase,
        private dateSrv: DateService) {}


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

    setCanceledbysender(sendingId:string): Promise<any> {
        return this.setCanceledUsr.run(sendingId, this.authSrv.fbuser.uid);
    }

    setCanceledbyoperator(sendingId:string): Promise<any> {
        return this.setCanceledOpr.run(sendingId, this.authSrv.fbuser.uid);
    }    

    /**
     * CREATE FORM HELPERS
     */

    isPickupDateValid(pickupDate, dateLimitMin, dateLimitMax) {
        return this.dateSrv.isBetween(pickupDate, dateLimitMin, dateLimitMax);
    }      

    setDateLimits() {
        const now = this.dateSrv.getIsoString();
        const max = this.dateSrv.addDays(now, PICKUP_DIFF_DAYS)
        const maxDisplay = this.dateSrv.addDays(now, PICKUP_DIFF_DAYS - 1)
        const minHuman = this.dateSrv.displayFormat(now, 'DD/MMM');
        const maxHuman = this.dateSrv.displayFormat(maxDisplay, 'DD/MMM');
        const dateLimits: DateLimits = {
            min: now,
            max: max,
            maxDisplay: maxDisplay,
            minHuman: minHuman,
            maxHuman: maxHuman,
        }
        return dateLimits;
    }

    /**
     *  READ
     */

    // get sending Observable
    getByIdObs(sendingId:string, snapshot:boolean = false): FirebaseObjectObservable<any> {
        return this.afDb.object(`sendings/${sendingId}`,  { 
                preserveSnapshot: snapshot 
            });
    }

    getByIdOnce(sendingId:string):Promise<any> {
        return firebase.database().ref(`sendings/${sendingId}`).once('value');
    }

    // get account active sendings Observable
    getAllActiveObs(snapshot:boolean = false): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userSendings/${accountId}/active`, { 
            preserveSnapshot: snapshot,
            query: {
                orderByChild: 'timestamp',
            } 
        });
    } 

    // get account closedd sendings Observable
    getAllClosedObs(snapshot:boolean = false, limitToLast:number = 100): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userSendings/${accountId}/closed`, { 
            preserveSnapshot: snapshot, 
            query: {
                orderByChild: 'timestamp',
                limitToLast: limitToLast
            }
        });
    }     

    getAllNotifications(snapshot:boolean = false, limitToLast:number = 100): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userNotificationsBySendingid/${accountId}`, { 
            preserveSnapshot: snapshot,
            query: {
                limitToLast: limitToLast
            } 
        });
    }

    /**
     *  Sending Live Geofire 
     */

    getGeofireLiveDatesObs(snapshot:boolean = false): FirebaseListObservable<any> {
        return this.afDb.list(`_sendingsLiveGeofireDates`, {
            preserveSnapshot: snapshot
        });
    }

    getGeofireLiveDates() {
        return firebase.database().ref('_sendingsLiveGeofireDates').once('value');
    }

    // datestring: 'MM_DD'
    getGeofireDbRef(dateSlug:string) {
        return firebase.database().ref(`_sendingsLiveGeofireByDate/${dateSlug}`);
    }

    // dbRef: firebase database reference
    getGeofire(dbRef:any) {
        return new GeoFire(dbRef);
    }    


    /**
     *  SendingLiveVacants
     */

    // get all sendings Vacants, in "waitoperator" status
    getLiveVacantObs(snapshot:boolean = false) {
        return this.afDb.list('_sendingsLive/', {
            query: {
                orderByChild: '_currentStatus',
                equalTo: 'waitoperator'
            }, 
            preserveSnapshot: snapshot,
        });         
    }
    getLiveByIdOnce(sendingId:string):Promise<any> {
        return firebase.database().ref(`_sendingsLive/${sendingId}`).once('value');
    }

    attemptToLockVacant(sendingId:string):Promise<any> {
        let userId = this.authSrv.fbuser.uid;
        return this.writeAttemptToLockVacant(sendingId, userId);
    }

    unlockVacant(sendingId:string): Promise<any> {
        return this.writeUnlockVacant(sendingId);
    }

    hasVacantExpired(sendingLiveSummary:SendingRequestLiveSummary) {
        // check if expired
        const now = this.dateSrv.getUnixTimestamp();
        const expiresAt = sendingLiveSummary._waitoperatorExpiresAt;
        const secondsBeforeExpires = expiresAt - now;
        // console.log('hasVacantExpired', secondsBeforeExpires);
        return secondsBeforeExpires>0 ? false : true;        
    }


    /**
     *  NOTIFICATIONS
     */

    // send notifications to user, based on setttings
    sendNotifications(sendingId:string, contentLog:any):void {
        this.notificationsSrv.sendLocalNotification(sendingId, contentLog);
    }

    /**
     *  VACANT WRITES
     */

    private writeUnlockVacant(sendingId:string):Promise<any> {
        let updates = {};
        updates[`_sendingsLive/${sendingId}/_locked`] = null;
        return this.dbRef.update(updates); 
    }

    private writeAttemptToLockVacant(sendingId:string, userId:string):Promise<any> {
        console.info('writeAttemptToLockVacant > init');
        let result = {
            didLock: false,
            hadError: false,
            lockTimeLeft: 0,
            isTaken: false,
            snapshot: {},
            error: {}            
        };
        let lockNode = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            userId: userId,
            taken: false
        };
        let ref = this.dbRef.child(`_sendingsLive/${sendingId}/_locked`);
        return new Promise((resolve, reject)=> {
            ref.transaction(currentData => {
                console.log('currentData', currentData);
                if(currentData === null) {
                    return lockNode;
                }else{
                    console.log('lockNode already exists, is it taken?');                    
                    if(currentData.taken==true) {
                        console.log('has been taken');
                        result.isTaken = true;
                        return;
                    }
                    console.log('lockNode already exists, has expired?');                    
                    let lockTimestamp = currentData.timestamp;
                    let nowTimestamp = this.dateSrv.getUnixTimestamp();
                    let diff = (nowTimestamp - lockTimestamp) / 1000;
                    if(diff > VACANT_LOCK_TIMEOUT) {
                        console.log('it has expired, update');
                        return lockNode;
                    }else{
                        console.log('did not expired, diff ', diff);
                        result.lockTimeLeft = VACANT_LOCK_TIMEOUT - diff;
                        return;
                    }
                }
            }, (error, committed, snapshot) => {
                result.snapshot = snapshot.val();                
                if(error) {
                    console.error('transaction failed > ', error);
                    result.hadError = true;
                    result.error = error;
                    reject(result);
                } else if (!committed) {
                    console.log('transaction aborted, lockNode exists');
                    result.didLock = false;
                } else {
                    console.log('transaction success');
                    result.didLock = true;
                }
                console.log('lockNode data > ', snapshot.val());
                resolve(result);                
            });
        });
    }

    /**
     * STRINGS
     */

    getStatusMessage(currentStageStatus) {
        let data:any = {
            message: '',
            color: 'primary',
            mode: 'note'
        };
        switch (currentStageStatus) {
            case 'created_registered':
                data.message = 'PAGAR';
                data.color = 'danger';
                data.mode = 'button';
                break;
            case 'created_paid':
                data.message = 'Verificando pago';
                break;
            case 'created_enabled':
            case 'live_waitoperator':
                data.message = 'Aguardar Operador';
                break;
            case 'live_gotoperator':
            case 'live_waitpickup':
                data.message = 'Aguardar Retiro';
                break;
            case 'live_pickedup':
            case 'live_inroute':
                data.message = 'En transito';
                break;
            case 'live_dropped':
            case 'closed_completed':
                data.message = 'Entregado';
                break;
            case 'closed_autocompleted':
                data.message = 'Autocompletado';
                break;
            case 'closed_canceledbysender':
                data.message = 'Cancelado por Solicitante';
                break;
            case 'closed_canceledbyoperator':
                data.message = 'Concelado por Operador';
                break;
            case 'closed_payexpired':
                data.message = 'Venci?? antes del pago';
                break;
            case 'closed_waitoperatorexpired':
                data.message = 'Venci?? antes de tener Operador';
                break;                  
        }
        return data;
    }    

}

// CLASSES

export class DateLimits {
    min:string;
    max:string;
    maxDisplay:string;
    minHuman:string;
    maxHuman:string;
}

export class TimeLimits {
    from: {
        min:string
    }
    to: {
        min:string
    }
}