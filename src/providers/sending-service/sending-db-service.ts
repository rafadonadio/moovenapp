import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { SendingRequest, SendingCurrentStatuses, SendingStages, StatusNode } from '../../shared/sending-interface';

// database childs   
const DB_CHILD_ACTIVE = '_active/';                          // status: created, vacant, holdforpickup, intransit, completed  
const DB_CHILD_INACTIVE = 'inactive/';
const DB_CHILD_STATUS_LOG = 'statusLog/';                    
// database nodes
const DB_SENDINGS = 'sendings/';
const DB_SENDINGS_HASHID_MAP = 'sendingsHashid/';
const DB_USERS_SENDINGS = 'usersSendings/'; 
// management
const DB_SENDINGS_CREATED = '_sendingsCreated/';            // status: created, not enabled (when enabled set live and vacant)    
//const DB_SENDINGS_LIVE = '_sendingsLive/';                // status: vacant, holdforpickup, intransit
//const DB_SENDINGS_EXPIRED = 'sendingsExpired/';           // status: expired (vacant not assigned to shipper)
//const DB_SENDINGS_COMPLETED = 'sendingsCompleted/';       // status: active that has been completed
//const DB_SENDINGS_UNCONCLUDED = 'sendingsUnconcluded/';   // status: active unconcluded
const DB_SENDINGS_STATUS_UPDATES_LOG = 'sendingsStatusUpdatesLog/';      // log all updates (triplicate in sendings and user)
// shipper view
const DB_SENDINGS_VACANT = '_sendingsVacant/';               // status: vacant > shipper view


@Injectable()
export class SendingDbService {

    // DATABASE LISTS
    public AUX_LIST = {
        USER: 'user',
        CREATED: 'created',
        LIVE: 'live',
        EXPIRED: 'expired',
        COMPLETED: 'completed',
        UNCONCLUDED: 'unconcluded', 
    }
    // DATABASE REF
    db: any = firebase.database();
    dbRef: any = firebase.database().ref();
    dbRefSendings: any = firebase.database().ref(DB_SENDINGS);

    constructor(public af:AngularFire) {
    }

    /**
     *  WRITE
     */

    newSendingKey():any {
        return this.dbRef.child(DB_SENDINGS).push().key;
    }

    getTimestamp():any {
        return firebase.database.ServerValue.TIMESTAMP;
    }

    newSending(sending:SendingRequest, summary:any, newKey:string, userid:string):Promise<any> {  
        console.log('dbSrv > newSending > start'); 
        // update refs array
        let updates = {};
        // sending full object
        updates[DB_SENDINGS + newKey] = sending;        
        // sending publicId hash reference 
        updates[DB_SENDINGS_HASHID_MAP + sending.publicId] = newKey;
        /* Duplicates */
        // sending status
        updates[DB_SENDINGS_VACANT + newKey] = summary;
        // user active sendings reference
        updates[DB_USERS_SENDINGS + userid + '/' + DB_CHILD_ACTIVE + newKey] = summary;
        // update and return promise
        return this.dbRef.update(updates);
    }

    updateSendingImageData(sendingId:string, downloadURL:string, imageName:string, imageFullpathRef:string):Promise<any> {
        console.log('updateSendingImage > init');
        let updates = {};
        updates[DB_SENDINGS + sendingId + '/objectImageDownloadUrl/'] = downloadURL;
        updates[DB_SENDINGS + sendingId + '/objectImageName/'] = imageName;
        updates[DB_SENDINGS + sendingId + '/objectImageFullPathRef/'] = imageFullpathRef;
        // delete objectImageURL because we already uploaded to storage
        updates[DB_SENDINGS + sendingId + '/objectImageUrl/'] = '';        
        return this.dbRef.update(updates)  
    }    

    /**
     *  READ
     */

    getSendingsLiveByUser(userid:string, getSnapshot:boolean = true) {
        console.log(userid);
        return this.af.database
                .list(DB_USERS_SENDINGS + userid + '/' + DB_CHILD_ACTIVE, { 
                    preserveSnapshot: getSnapshot,
                });
    }  

    getSendingById(sendingId:string, getSnapshot:boolean = true) {
        return this.af.database
                .object(DB_SENDINGS + sendingId, {
                    preserveSnapshot: getSnapshot,
                });       
    }    

}
