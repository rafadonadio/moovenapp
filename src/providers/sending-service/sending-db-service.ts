import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { SENDING_DB, SendingRequest } from '../../models/sending-model';

const DB = SENDING_DB;

@Injectable()
export class SendingDbService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: any = firebase.database().ref();

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

    newSending(sending:SendingRequest, summary:any, newKey:string, userid:string):Promise<any> {  
        console.log('dbSrv > newSending > start'); 
        // update refs array
        let updates = {};
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

    updateSendingImageData(sendingId:string, downloadURL:string, imageName:string, imageFullpathRef:string):Promise<any> {
        console.log('updateSendingImage > init');
        let updates = {};
        updates[DB.ALL.REF + sendingId + '/objectImageDownloadUrl/'] = downloadURL;
        updates[DB.ALL.REF + sendingId + '/objectImageName/'] = imageName;
        updates[DB.ALL.REF + sendingId + '/objectImageFullPathRef/'] = imageFullpathRef;
        // delete value of objectImageUrlTemp because we already uploaded to storage
        updates[DB.ALL.REF + sendingId + '/objectImageUrlTemp/'] = '';        
        return this.dbRef.update(updates)  
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

}
