import { DateService } from '../date-service/date-service';
import {
    NOTIFICATIONS_CFG,
    SENDING_DB,
    SendingNotifications,
    SendingRequest
} from '../../models/sending-model';
import { AngularFire } from 'angularfire2';
import { Injectable } from '@angular/core';

const CFG = NOTIFICATIONS_CFG;
const DB = SENDING_DB;


@Injectable()
export class SendingNotificationsService {

    // DATABASE REF
    db: any = firebase.database();
    dbRef: firebase.database.Reference = firebase.database().ref();

    constructor(public af:AngularFire,
        public dateSrv: DateService) {
    }

    logCurrentStageStatus(currentStageStatus:string) {
        return CFG.hasOwnProperty(currentStageStatus);
    }

    notifyCurrentStageStatus(currentStageStatus:string) {
        let exist = CFG.hasOwnProperty(currentStageStatus);
        console.log('notifyCurrentStageStatus: ', currentStageStatus, exist, CFG[currentStageStatus].NOTIFY);
        if(exist) {
            return CFG[currentStageStatus].NOTIFY;
        }else{
            console.log('notifyCurrentStageStatus > not exist', currentStageStatus);
            return false;
        }
    }    

    // new notifications list key
    newKey(sendingId:string):any {
        return this.dbRef.child(DB.ALL.REF + sendingId + DB.ALL._CHILD.NOTIFICATIONS).push().key;
    }

    logToDB(sendingId:string, sending:SendingRequest):firebase.Promise<any> {
        // key for new item in array
        let newKey = this.newKey(sendingId);
        // get log content
        let userContentLog = this.setlogContent(sending);
        // set paths
        let updates = {};
        updates[DB.ALL.REF + sendingId + DB.ALL._CHILD.NOTIFICATIONS + newKey] = userContentLog;
        updates[DB.NOTIFICATIONS_ALL.REF + newKey] = userContentLog;
        return this.dbRef.update(updates);
    }

    private setlogContent(sending:SendingRequest):any {
        // LANGUAGE SELECTOR
        const LANG = 'es';
        // aux
        let currentStage = sending._currentStage;
        let currentStatus = sending._currentStatus;
        let currentStageStatus = `${currentStage}_${currentStatus}`;
        let timestamp = sending._stages[currentStage].status[currentStatus].timestamp;
        let humanDate = this.dateSrv.transformTimestampToHuman(timestamp);
        // content
        let content:SendingNotifications = {
            sendingId:sending.sendingId,
            publicId: sending.publicId,
            timestamp: timestamp,
            currentStage: currentStage,
            currentStatus: currentStatus,
            currentStage_Status: currentStageStatus,
            title: CFG[currentStageStatus].TITLE[LANG],
            msg: CFG[currentStageStatus].MSG[LANG],
            icon: CFG[currentStageStatus].ICON 
        }
        // set content
        switch(currentStageStatus) {
            case 'created_registered': 
                content.msg = content.msg.replace('{DATE}', humanDate);
                content.msg = content.msg.replace('{PUBLICID}', sending.publicId);
                break;
            case 'created_paid':
                content.msg = content.msg.replace('{PRICE}', sending.price.toString());
                break;
            case 'created_enabled':
                // no vars to replace
                break;
            case 'live_waitoperator':
                
                break;             
            case 'live_gotoperator':
                
                break;    
            case 'live_waitpickup':
                
                break;           
            case 'live_pickedup':
                
                break;         
            case 'live_inroute':
                
                break;            
            case 'live_dropped':
                
                break;        
            case 'closed_complete':
                
                break;           
            case 'closed_canceledbysender':
                
                break;                  
            case 'closed_canceledbyoperator':
                
                break;                     
            case 'closed_gotoperatorexpired':
                
                break;                                                                                                                                                                                          
        }
        return content;        
    }

}

