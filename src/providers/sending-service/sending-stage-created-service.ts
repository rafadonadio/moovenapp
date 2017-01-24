import { SendingPaymentService } from './sending-payment-service';
import { Injectable } from '@angular/core';
import {
    SENDING_CFG,
    SendingRequest,
    SendingStages
} from '../../models/sending-model';
import { SendingStagesService } from '../sending-service/sending-stages-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { SendingNotificationsService } from './sending-notifications-service';
import { HashService } from '../hash-service/hash-service';

import firebase from 'firebase';

// CFG
const CFG = SENDING_CFG;
// storage nodes
const STRG_USER_FILES = 'userFiles/';

@Injectable()
export class SendingStageCreatedService {

    constructor(public hashSrv: HashService,
        public dbSrv: SendingDbService,
        public stagesSrv: SendingStagesService,
        public reqSrv: SendingRequestService,
        public notificationsSrv:SendingNotificationsService,
        public paySrv: SendingPaymentService) {

    }

    create(sending:SendingRequest, userId:string):Promise<any> {
        console.info('create() > start');
        /* aux */
        let timestamp = this.dbSrv.getTimestamp();
        /* populate object */
        sending.publicId = this.hashSrv.genId();
        sending.timestamp = timestamp;
        sending.userUid = userId;
        // security codes
        sending.pickupSecurityCode = this.hashSrv.genSecurityCode();
        sending.dropSecurityCode = this.hashSrv.genSecurityCode();
        /* set stage initial values, and duplicated values (for NoSql reasons) */
        sending._stages = this.stagesSrv.initialize(CFG.STAGE.CREATED.ID, timestamp);
        sending._currentStage = this.stagesSrv.getCurrent(sending._stages);
        sending._currentStatus = this.stagesSrv.getCurrentStatus(sending._stages);
        sending._currentStage_Status = this.stagesSrv.getCurrentStageStatus(sending._stages);

        // get a new db key 
        let newKey = this.dbSrv.newSendingKey();

        return new Promise((resolve, reject) => {
            let steps = { created: false, imageSet: false, imageUploaded: false, sendingId: '' };
            this.writeNewSending(sending, newKey, userId)
                .then(() => {
                    console.info('writeNewSending > success');
                    steps.created = true;
                    steps.sendingId = newKey;
                    // set new notification
                    this.logNotifications(newKey, sending);
                    // save image
                    if(sending.objectImageSet) {
                        // ImageSet: upload and save
                        steps.imageSet = true;
                        this.uploadSendingImage(newKey, sending.objectImageUrlTemp, userId)
                            .then((snapshot) => {
                                steps.imageUploaded = true;
                                this.updateSendingImage(newKey, snapshot.downloadURL, snapshot.ref.name, snapshot.ref.fullPath);
                                console.log(steps);
                                resolve(steps);                                
                            });
                    }else{
                        // no image tu upload
                        console.log(steps);
                        resolve(steps);
                    }                    
                })               
                .catch((error) => {
                    if(steps.created) {
                        console.error('Image upload failed > ', error);
                        // do something about it ?
                        resolve(steps);
                    }else{
                        console.error('writeNewSending > error ', error);
                        reject(error);
                    }
                });
        });
    }

    // pay sending
    pay(sendingId:string, userId:string):Promise<any> {    
        console.info('processPayment > start');
        // aux
        let steps = {
            get: false,
            payment: false,
            update: false,
            updateDb: false
        };
        let sending:SendingRequest;           
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success ', sendingId);
                    steps.get = true;
                    sending = snapshot.val();
                    // proccess payment
                    return this.paySrv.checkout();
                })
                .then((result) => {
                    console.log('proccesPayment > success ', result);
                    if(result.completed == true){
                        steps.payment = true;
                    }else{
                        steps.payment = false;
                        resolve(steps);
                    }
                    //update CREATED to PAID 
                    let timestamp:any = firebase.database.ServerValue.TIMESTAMP; 
                    let currentStage = CFG.STAGE.CREATED.ID;
                    let currentStatus = CFG.STAGE.CREATED.STATUS.PAID;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);
                })
                .then((stages) => {      
                    console.log('updateStage > success');
                    steps.update = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages);
                    // set new notification
                    this.logNotifications(sendingId, sending);                             
                    // update stages in database
                    return this.dbSrv.updateSendingCreatedStage(userId, sendingId, stages);
                })
                .then(() => {
                    console.log('updateSendingCreatedStage > success');
                    steps.updateDb = true;
                    resolve(steps);
                })
                .catch((error) => {
                    console.log('Pay > error', error);
                    if(steps.updateDb == true) {
                        resolve(steps);
                    }else{
                        reject(steps);
                    }
                }); 
        });        
    }    

    // enable sending
    enable(sendingId:string, userId:string) {
        console.info('enable > start');
        // aux
        let steps = {
            get: false,
            update: false,
            updateDb: false,
            move: false
        };
        let sending:SendingRequest;
        let currentStage:string;
        let currentStatus:string;
        let timestamp:any = firebase.database.ServerValue.TIMESTAMP;     
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success ', sendingId);
                    steps.get = true;
                    sending = snapshot.val();
                    //update PAID to ENABLED
                   currentStage = CFG.STAGE.CREATED.ID;
                    currentStatus = CFG.STAGE.CREATED.STATUS.ENABLED;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);
                })
                .then((stages) => {    
                    console.log('updateStage > success');
                    steps.update = true;      
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages);  
                    // set new notification
                    this.logNotifications(sendingId, sending);                                
                    // update stages in database
                    return this.dbSrv.updateSendingCreatedStage(userId, sendingId, stages);
                })
                .then(() => {
                    console.log('updateSendingCreatedStage > success');
                    steps.updateDb = true;
                    // move CREATED to LIVE
                    return this.moveCreatedToLive(sendingId, userId);
                })
                .then(() => {
                    console.log('moveCreatedToLive > success');
                    steps.move = true;
                    resolve(steps);
                })
                .catch((error) => {
                    console.log('getSendingbyIdOnce OR updateSendingCreatedStages > error', error);
                    if(steps.updateDb == true) {
                        resolve(steps);
                    }else{
                        reject(steps);
                    }
                }); 
        });        
    }


    /**
     *  MOVE SENDING FROM "CURRENT_STAGE" TO "NEW_STAGE"   
     */    

    private moveCreatedToLive(sendingId, userId:string) {
        console.info('moveCreatedToLive > start');
        let sending:SendingRequest;
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let currentStage = CFG.STAGE.LIVE.ID;
        let currentStatus = CFG.STAGE.LIVE.STATUS.WAITOPERATOR;
        let steps = {
            getSending: false,
            updateStage: false,
            writeDb: false 
        }
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSending > success');
                    steps.getSending = true;
                    sending = snapshot.val();
                    // set stage values
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);
                })
                .then((stages) => {
                    console.log('updateStageTo > success', currentStage, currentStatus);
                    steps.updateStage = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages);
                    // set new notification
                    this.logNotifications(sendingId, sending);                                         
                    // set Live values and move                    
                    let summary = this.reqSrv.getSummary(sending, currentStage);
                    return this.dbSrv.moveSendingCreatedToLive(userId, sending, summary);
                })
                .then(() => {
                    console.log('moveSendingCreatedToLive > success');
                    steps.writeDb = true;
                    resolve(steps);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }


    /**
     *  DATABASE WRITE
     */ 

    private writeNewSending(sending:SendingRequest, newKey:string, userId:string):firebase.Promise<any> {  
            console.info('writeNewSending > start');
            //console.log('data > ', sending, newKey, userId);
            let summary:any = this.reqSrv.getSummary(sending, CFG.STAGE.CREATED.ID);
            return this.dbSrv.newSending(sending, summary, newKey, userId); 
    }

    private updateSendingImage(
        sendingId:string, 
        downloadURL:string, 
        imageName:string, 
        imageFullpathRef:string):void {
            console.info('updateSendingImage > start');
            this.dbSrv.updateSendingImageData(sendingId, downloadURL, imageName, imageFullpathRef)
                .then(()=>{
                    console.log('updateSendingImage > success');
                })
                .catch((error) => {
                    console.error('updateSendingImage > error > ', error);
                });        
    }


    /**
     *  NOTIFICATIONS
     */

    private logNotifications(sendingId:string, sending:SendingRequest):void {
        console.info('__runNotifications > start');
        // currentStageStatus has to be logged? (check if config is set)
        if(this.notificationsSrv.logCurrentStageStatus(sending._currentStage_Status)) {
            // get log content
            let contentLog = this.notificationsSrv.setlogContent(sending);            
            // log to DB
            this.notificationsSrv.logToDB(sendingId, contentLog)
                .then(() => {
                    console.log('logToDB > success')
                    // notify  
                    this.sendNotifications(sendingId, contentLog);
                })  
                .catch((error) => {
                    console.error('notifications error', error);
                });
        }else{
            console.info('runNotifications > nothing to log');
        }
    }

    // send notifications to user, based on setttings
    private sendNotifications(sendingId:string, contentLog:any):void {
        this.notificationsSrv.sendLocalNotification(sendingId, contentLog);
    }


    /**
     *  STORAGE UPLOAD
     */

    private uploadSendingImage(sendingId:string, imageDataURL:string, userId:string): Promise<any> {
        console.info('uploadSendingImage');
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(userId)
                    .child(sendingId + '.jpg')
                    .putString(imageDataURL, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
            uploadTask.on('state_changed', function(snapshot) {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Upload is ' + progress + '% done');
            }, function (error:any) {
                // error
                console.log('failed > ', error.code);
                reject(error);
            }, function() {
                // success
                resolve(uploadTask.snapshot);
                console.log('uploadSendingImage > success');
            });
        });
    }

    /**
     *  HELPERS
     */

    private updateLocalSendingStages(sending:SendingRequest, stages:SendingStages):SendingRequest {
        sending._currentStage = stages._current;
        sending._currentStatus = stages[stages._current]._current;
        sending._currentStage_Status = `${sending._currentStage}_${sending._currentStatus}`;
        sending._stages = stages;
        return sending;
    }

}