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
        public notificationsSrv:SendingNotificationsService) {

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
                })
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


}