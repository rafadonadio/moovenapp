import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { SENDING_DB, SendingRequest, SendingStages } from '../../models/sending-model';

const DB = SENDING_DB;

@Injectable()
export class SendingDbService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: firebase.database.Reference = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    /**
     *  WRITE
     */

    newSendingKey():any {
        return this.dbRef.child(DB.ALL.REF).push().key;
    }

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    newSending(sending:SendingRequest, summary:any, newKey:string, userid:string):firebase.Promise<any> {  
        console.log('dbSrv > newSending > start'); 
        // update refs array
        let updates = {};
        // set sendingId
        sending.sendingId = newKey;
        // sending full object
        updates[DB.ALL.REF + newKey] = sending;        
        // sending publicId hash reference 
        updates[DB.HASHID.REF + sending.publicId] = newKey;
        // add to sending stage created
        updates[DB.STAGE_CREATED.REF + newKey] = summary;
        // user active sendings reference
        updates[DB.BYUSER.REF + userid + DB.BYUSER._CHILD.ACTIVE.REF + newKey] = summary;
        // update and return promise
        return this.dbRef.update(updates);
    }

    updateSendingImageData(sendingId:string, downloadURL:string, imageName:string, imageFullpathRef:string):firebase.Promise<any> {
        console.log('updateSendingImage > init');
        let updates = {};
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.IMAGEURL] = downloadURL;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.IMAGENAME] = imageName;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.FULLPATH] = imageFullpathRef;
        // delete value of objectImageUrlTemp because we already uploaded to storage
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.IMAGETEMP] = '';        
        return this.dbRef.update(updates)  
    }    

    updateSendingCreatedStage(userId:string, sendingId:string, stages:SendingStages):firebase.Promise<any> {
        console.log('update sending stages > init > params > ', userId, sendingId, stages);
        // set auxiliar value
        let currentStage = stages._current;
        let currentStatus = stages.created._current;
        let currentStage_Status = currentStage + '_' + currentStatus; 
        // prepare updates
        let updates = {};
        // update ALL
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.STAGES] = stages;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE] = currentStage;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STATUS] = currentStatus;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE_STATUS] = currentStage_Status;
        // update BYUSER
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE.REF] = currentStage;
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STATUS.REF] = currentStatus;
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status;                
        // update CREATED
        updates[DB.STAGE_CREATED.REF + sendingId + DB.STAGE_CREATED._CHILD.CURRENT_STAGE.REF] = currentStage;
        updates[DB.STAGE_CREATED.REF + sendingId + DB.STAGE_CREATED._CHILD.CURRENT_STATUS.REF] = currentStatus;
        updates[DB.STAGE_CREATED.REF + sendingId + DB.STAGE_CREATED._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status; 
        //console.log('updateSendingCreatedStages > updates > ', updates);               
        return this.dbRef.update(updates);         
    }

    moveSendingCreatedToLive(userId:string, sending:SendingRequest, summary:any) {
        console.log('moveSendingCreatedToLive > start');
        let sendingId = sending.sendingId;
        let stages = sending._stages;
        let currentStage = sending._currentStage;
        let currentStatus = sending._currentStatus;
        let currentStage_Status = currentStage + '_' + currentStatus; 
        // prepare updates
        let updates = {};
        // delete sendingCreated
        updates[DB.STAGE_CREATED.REF + sendingId] = null;
        // write sendingLive
        updates[DB.STAGE_LIVE.REF + sendingId] = summary;
        // update ALL stages
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.STAGES] = stages;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE] = currentStage;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STATUS] = currentStatus;
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.CURRENT_STAGE_STATUS] = currentStage_Status;        
        // update BYUSER
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE.REF] = currentStage;
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STATUS.REF] = currentStatus;
        updates[DB.BYUSER.REF + userId + DB.BYUSER._CHILD.ACTIVE.REF + sendingId + DB.BYUSER._CHILD.CURRENT_STAGE_STATUS.REF] = currentStage_Status;
        console.log('moveSendingCreatedToLive > updates > ', updates);               
        return this.dbRef.update(updates);               
    }


    /**
     *  READ
     */

    getSendingsLiveByUser(userid:string, getSnapshot:boolean = true) {
        return this.af.database
                .list(DB.BYUSER.REF + userid + DB.BYUSER._CHILD.ACTIVE.REF, { 
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

}
