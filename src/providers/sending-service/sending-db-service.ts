import { FirebaseListObservable } from 'angularfire2/database';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { DateService } from '../date-service/date-service';
import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { SENDING_DB } from '../../models/sending-model';

import firebase from 'firebase';

const DB = SENDING_DB;
const VACANT_LOCK_TIMEOUT = SHIPMENT_CFG.CONFIRM_TIMEOUT + SHIPMENT_CFG.WAIT_AFTER_UNLOCK; // ADDED SECONDS TO AVOID COLISSIONS

@Injectable()
export class SendingDbService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: firebase.database.Reference = firebase.database().ref();

    constructor(public af:AngularFire,
        public dateSrv:DateService) {
    }

    /**
     *  HELPERS
     */

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    getDatabaseRef(child?:string) {
        return firebase.database().ref();
    }

    /**
     *  SENDINGS
     */

    newSendingKey():any {
        return this.dbRef.child('sendings/').push().key;
    }

    newSendingTaskKey():any  {
        return this.dbRef.child('sendingsTask/').push().key;
    }



    /** DELETE UNUSED */

    /**
     *  WRITE
     */

    // moveSendingLiveToClosed(userId:string, sending:SendingRequest, summary:any) {
    //     console.log('moveSendingCreatedToLive > start');
    //     let sendingId = sending.sendingId;
    //     let stages = sending._stages;
    //     let currentStage = sending._currentStage;
    //     let currentStatus = sending._currentStatus;
    //     let currentStage_Status = currentStage + '_' + currentStatus; 
    //     // prepare updates
    //     let updates = {};
    //     // delete sendingCreated
    //     updates[DB.STAGE_CREATED.REF + sendingId] = null;
    //     // write sendingLive
    //     updates[DB.STAGE_LIVE.REF + sendingId] = summary;
    //     // update ALL stages
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.STAGES] = stages;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE] = currentStage;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STATUS] = currentStatus;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE_STATUS] = currentStage_Status;        
    //     // update BYUSER
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE.REF] = currentStage;
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STATUS.REF] = currentStatus;
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status;
    //     console.log('moveSendingCreatedToLive > updates > ', updates);               
    //     return this.dbRef.update(updates);               
    // }


    attemptToLockSendingLiveVacant(sendingId:string, userId:string):Promise<any> {
        console.info('attemptToLockSendingLiveVacant > init');
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
        let ref = this.dbRef.child(DB.STAGE_LIVE.REF + sendingId + DB.STAGE_LIVE._LOCK.REF);
        let self = this;
        return new Promise((resolve, reject)=> {
            ref.transaction(function(currentData:any) {
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
                    let nowTimestamp = self.dateSrv.getUnixTimestamp();
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
            }, function(error, committed, snapshot) {
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

    unlockSendingLiveVacant(sendingId:string):firebase.Promise<any> {
        let updates = {};
        updates[DB.STAGE_LIVE.REF + sendingId + DB.STAGE_LIVE._LOCK.REF] = null;
        return this.dbRef.update(updates); 
    }

    // updateShipmentAndSendingLiveStage(userId:string, sendingId:string, stages:SendingStages, shipmentId: string, operatorUserId:string):firebase.Promise<any> {
    //     console.log('update sending and shipment stages > init');
    //     // set auxiliar value
    //     let currentStage = stages._current;
    //     let currentStatus = stages[currentStage]._current;
    //     let currentStage_Status = `${currentStage}_${currentStatus}`; 
    //     // prepare updates
    //     let updates = {};
    //     /**
    //      * SENDING
    //      */
    //     // update ALL (sendings)
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.STAGES] = stages;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE] = currentStage;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STATUS] = currentStatus;
    //     updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE_STATUS] = currentStage_Status;
    //     // update BYUSER (sendings)
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE.REF] = currentStage;
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STATUS.REF] = currentStatus;
    //     updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status;
    //     // update LIVE (sendings)
    //     updates[DB.STAGE_LIVE.REF + sendingId + DB.STAGE_LIVE._CHILD.CURRENT_STAGE.REF] = currentStage;
    //     updates[DB.STAGE_LIVE.REF + sendingId + DB.STAGE_LIVE._CHILD.CURRENT_STATUS.REF] = currentStatus;
    //     updates[DB.STAGE_LIVE.REF + sendingId + DB.STAGE_LIVE._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status; 
    //     /**
    //      * SHIPMENT
    //     */        
    //     // update ALL (shipments)
    //     updates[DBSHP.ALL.REF + shipmentId + DBSHP.ALL._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status; 
    //     // update operatorShipment.active
    //     updates[DBSHP.BYUSER.REF + operatorUserId + DBSHP.BYUSER._CHILD.ACTIVE.REF + shipmentId + DBSHP.BYUSER._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status;
    //     // update
    //     console.log('updateSendingCreatedStages > updates > ', updates);               
    //     return this.dbRef.update(updates);         
    // }


    /**
     *  READ
     */

    getSendingsLiveByUser(userid:string, getSnapshot:boolean = true) {
        return this.af.database
                .list(DB.BYUSER.REF + userid + DB.BYUSER._CHILD.ACTIVE.REF, { 
                    preserveSnapshot: getSnapshot,
                });
    }  

    getSendingsLiveVacantRef():firebase.database.Query {
        return this.dbRef.child(DB.STAGE_LIVE.REF).orderByChild('_currentStatus').equalTo('waitoperator');        
    }

    getSendingsLiveVacant(userid:string, getSnapshot:boolean = true):FirebaseListObservable<any[]> {
        return this.af.database
                .list(DB.STAGE_LIVE.REF, {
                    query: {
                        orderByChild: '_currentStatus',
                        equalTo: 'waitoperator'
                    }, 
                    preserveSnapshot: getSnapshot,
                });        
    }

    getSendingById(sendingId:string, getSnapshot:boolean = true) {
        return this.af.database
                .object(DB.ALL.REF + sendingId, {
                    preserveSnapshot: getSnapshot,
                });       
    }

    getSendingbyIdOnce(sendingId:string) {
        return this.dbRef.child(DB.ALL.REF + sendingId).once('value');
    }

    getSendingLiveVacantByIdOnce(sendingId:string) {
        return this.dbRef.child(DB.STAGE_LIVE + sendingId).once('value');
    }

}
