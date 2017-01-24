import { SendingNotificationsService } from './sending-notifications-service';
import { UserAccountSettings, UserProfileData } from '../../models/user-model';
import { ShipmentsService } from '../shipments-service/shipments-service';
import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { SendingStagesService } from '../sending-service/sending-stages-service';
import { HashService } from '../hash-service/hash-service';

import {
    SENDING_CFG,
    SendingOperator,
    SendingRequest,
    SendingStages,
    StageClosedNode
} from '../../models/sending-model';

import firebase from 'firebase';

const CFG = SENDING_CFG;

// storage nodes
const STRG_USER_FILES = 'userFiles/';

@Injectable()
export class SendingService {

    user: firebase.User;
    userSettings: UserAccountSettings;

    constructor(public users: UsersService,
        public hashSrv: HashService,
        public reqSrv: SendingRequestService,
        public dbSrv: SendingDbService,
        public stagesSrv: SendingStagesService,
        public shipmentSrv:ShipmentsService,
        public notificationsSrv:SendingNotificationsService) {
        this.setUser();
    }

    /**
     * Init sending data object
     * @return {object} [description]
     */
    initRequest() {
        return this.reqSrv.getInitialized();
    }

    create(sending:SendingRequest):Promise<any> {
        console.info('create() > start');
        /* aux */
        let timestamp = this.dbSrv.getTimestamp();
        let userId = this.user.uid;
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
                        this.uploadSendingImage(newKey, sending.objectImageUrlTemp)
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

    processPayment(sendingId:string):Promise<any> {
        console.info('processPayment > start');
        // aux
        let steps = {
            get: false,
            payment: false,
            update1: false,
            update2: false,
            updateDb: false,
            move: false
        };
        let sending:SendingRequest;
        let currentStage:string;
        let currentStatus:string;
        let timestamp:any = firebase.database.ServerValue.TIMESTAMP;
        
        // -------------
        // run payment
        // ????
        // -------------

        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success ', sendingId);
                    steps.get = true;
                    sending = snapshot.val();
                    //update CREATED to PAID and then to ENABLED
                    currentStage = CFG.STAGE.CREATED.ID;
                    currentStatus = CFG.STAGE.CREATED.STATUS.PAID;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);
                })
                .then((stages1) => {      
                    console.log('updateStageTo 1 > success');
                    steps.update1 = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages1);
                    // set new notification
                    this.logNotifications(sendingId, sending);
                    // next
                    currentStage = CFG.STAGE.CREATED.ID;
                    currentStatus = CFG.STAGE.CREATED.STATUS.ENABLED;
                    return this.stagesSrv.updateStageTo(stages1, currentStage, currentStatus, timestamp);  
                })
                .then((stages2) => {    
                    console.log('updateStageTo 2 > success');
                    steps.update2 = true;      
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages2);  
                    // set new notification
                    this.logNotifications(sendingId, sending);                                
                    // update stages in database
                    return this.dbSrv.updateSendingCreatedStage(this.user.uid, sendingId, stages2);
                })
                .then(() => {
                    console.log('updateSendingCreatedStage > success');
                    steps.updateDb = true;
                    // move CREATED to LIVE
                    return this.moveCreatedToLive(sendingId);
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

    attemptToLockVacant(sendingId:string):Promise<any> {
        return this.attemptToLockLiveVacantSending(sendingId);
    }

    unlockVacant(sendingId:string): firebase.Promise<any> {
        return this.dbSrv.unlockSendingLiveVacant(sendingId);
    }

    // sending is locked, and is within timeframe available to confirm
    // this is not being checked again
    takeVacant(sendingId:string):Promise<any> {
        console.info('confirmVacant > start');
        let steps = {
            get: false,
            getOperator: false,
            updateStage1: false,
            updateStage2: false,
            updateDb: false,
            createShipment: false
        };
        let sending:SendingRequest;
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let sendingOperator: SendingOperator;        
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success ', sendingId);
                    steps.get = true;
                    sending = snapshot.val();
                    return this.getUserDataAsOperator();
                })
                .then((operator) => {
                    console.log('get operator data > success', operator);
                    steps.getOperator = true;
                    sendingOperator = operator;
                    sending._operator = operator;
                    // update LIVE to GOTOPERATOR
                    let currentStage = CFG.STAGE.LIVE.ID;
                    let currentStatus = CFG.STAGE.LIVE.STATUS.GOTOPERATOR; // Got Operator
                    // update stage values
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);
                })
                .then((stages1) => {      
                    console.log('updateStageTo 1 > success');
                    steps.updateStage1 = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages1);
                    // set new notification
                    this.logNotifications(sendingId, sending);
                    //update LIVE to WAITPICKUP
                    let currentStage = CFG.STAGE.LIVE.ID;
                    let currentStatus = CFG.STAGE.LIVE.STATUS.WAITPICKUP;
                    // update stage values
                    return this.stagesSrv.updateStageTo(stages1, currentStage, currentStatus, timestamp);  
                })              
                .then((stages2) => {    
                    console.log('updateStageTo 2 > success');
                    steps.updateStage2 = true;     
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages2);
                    // set new notification
                    this.logNotifications(sendingId, sending);                                                 
                    // update SendingLive Stage and set Operator
                    return this.dbSrv.setSendingLiveOperatorAndUpdateStage(this.user.uid, sendingId, stages2, sendingOperator);
                })
                .then(() => {
                    console.log('updateSendingLiveStage > success');
                    steps.updateDb = true;
                    // create the shipment for reference
                    return this.shipmentSrv.create(sending);
                })                
                .then(() => {
                    console.log('shipment create > success');
                    steps.createShipment = true;
                    // all good
                    resolve(steps);
                }) 
                .catch((error) => {
                    console.log('getSendingbyIdOnce OR updateSendingLiveStage > error', error);
                    if(steps.createShipment == true) {
                        resolve(steps);
                    }else{
                        reject(steps);
                    }
                });                               
        });
    }

    /**
     *  UPDATE STATUS IN STAGE.LIVE
     */

    updateLiveStatusToPickedup(shipmentId:string, sendingId:string):Promise<any> {
        console.info('updateStatusOnStageLive > init');
        let steps = {
            get: false,
            update1: false,
            update2: false,
            updateDb: false
        };
        let sending:SendingRequest;
        let currentStage:string;
        let currentStatus:string;
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let operatorUserId:string;
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success');
                    steps.get = true;
                    sending = snapshot.val();
                    operatorUserId = sending._operator.userId;
                    //update LIVE STAGE to new Status
                    currentStage = CFG.STAGE.LIVE.ID;
                    currentStatus = CFG.STAGE.LIVE.STATUS.PICKEDUP;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);                    
                })
                .then((stages1) => {
                    console.log('updateStageTo > success');
                    steps.update1 = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages1);
                    // set new notification
                    this.logNotifications(sendingId, sending);                    
                    //update LIVE STAGE to new Status
                    currentStage = CFG.STAGE.LIVE.ID;
                    currentStatus = CFG.STAGE.LIVE.STATUS.INROUTE;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp); 
                })
                .then((stages2) => {
                    console.log('updateStageTo > success');
                    steps.update2 = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages2);
                    // set new notification
                    this.logNotifications(sendingId, sending);
                    // update stages in database
                    return this.dbSrv.updateShipmentAndSendingLiveStage(this.user.uid, sendingId, stages2, shipmentId, operatorUserId);
                })
                .then(() => {
                    console.log('updateShipmentAndSendingLiveStage > success');
                    steps.updateDb = true;
                    resolve(steps);
                })
                .catch((error) => {
                    console.log('updateShipmentAndSendingLiveStage > error', error);
                    reject(steps);
                });
        });
    }

    updateLiveStatusToDroppedAndComplete(shipmentId:string, sendingId:string):Promise<any> {
        console.info('updateLiveStatusToDroppedAndComplete > init');
        let steps = {
            get: false,
            update: false, // set stage LIVE.DROPPED
            updateDb: false, // update db
            move: false, // set stage CLOSED.COMPLETE
        };
        let sending:SendingRequest;
        let currentStage:string;
        let currentStatus:string;
        let timestamp:any = firebase.database.ServerValue.TIMESTAMP; 
        let operatorUserId:string;               
        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success');
                    steps.get = true;
                    sending = snapshot.val();
                    operatorUserId = sending._operator.userId;
                    //update LIVE STAGE to new Status
                    currentStage = CFG.STAGE.LIVE.ID;
                    currentStatus = CFG.STAGE.LIVE.STATUS.DROPPED;
                    return this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);                    
                })     
                .then((stages2) => {
                    console.log('updateStageTo > success');
                    steps.update = true;
                    // update local variable, used by notification log
                    sending = this.updateLocalSendingStages(sending, stages2);
                    // set new notification
                    this.logNotifications(sendingId, sending);
                    // update stages in database
                    return this.dbSrv.updateShipmentAndSendingLiveStage(this.user.uid, sendingId, stages2, shipmentId, operatorUserId);
                })           
                .then(() => {
                    console.log('updateShipmentAndSendingLiveStage > success');
                    steps.updateDb = true;
                    // move CREATED to LIVE
                    return this.moveLiveToClosed(sendingId, CFG.STAGE.CLOSED.STATUS.COMPLETE);
                })
                .then(() => {
                    console.log('moveLiveToClosed > success');
                    steps.move = true;
                    resolve(steps);
                })

                .catch((error) => {
                    console.log('updateShipmentAndSendingLiveStage > error', error);
                    reject(steps);
                });                
        });
    }

    updateLiveStatusToCanceled(shipmentId:string, sendingId:string):Promise<any> {

        return new Promise((resolve, reject) => {
            
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
     *  MOVE SENDING FROM "CURRENT_STAGE" TO "NEW_STAGE"   
     */    

    private moveCreatedToLive(sendingId) {
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
                    return this.dbSrv.moveSendingCreatedToLive(this.user.uid, sending, summary);
                })
                .then(() => {
                    console.log('moveSendingCreatedToLive > success');
                    steps.writeDb = true;
                    resolve(steps);
                })
                .catch((error) => {

                });
        });
    }

    private moveLiveToClosed(sendingId:string, newStatus:string) {
        console.info('moveLiveToComplete > start');
        let sending:SendingRequest;
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let currentStage = CFG.STAGE.CLOSED.ID;
        let currentStatus = newStatus;
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
                    return this.dbSrv.moveSendingCreatedToLive(this.user.uid, sending, summary);
                })
                .then(() => {
                    console.log('moveSendingCreatedToLive > success');
                    steps.writeDb = true;
                    resolve(steps);
                })
                .catch((error) => {

                });
        });
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
        return this.dbSrv.getSendingsLiveByUser(this.user.uid);
    }

    private getAllLiveVacantRef():firebase.database.Query  {
        return this.dbSrv.getSendingsLiveVacantRef();
    }      

    private getSendingById(sendingId:string) {
        return this.dbSrv.getSendingById(sendingId);
    }

    /**
     *  STORAGE UPLOAD
     */

    uploadSendingImage(sendingId:string, imageDataURL: string): Promise<any> {
        console.group('uploadSendingImage');
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.user.uid)
                    .child(sendingId + '.jpg')
                    .putString(imageDataURL, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
            uploadTask.on('state_changed', function(snapshot) {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Upload is ' + progress + '% done');
            }, function (error:any) {
                // error
                console.log('failed > ', error.code);
                reject(error);
                console.groupEnd();
            }, function() {
                // success
                resolve(uploadTask.snapshot);
                console.log('uploadSendingImage > success');
                console.groupEnd();                
            });
        });
    }

    /**
     *  NOTIFICATIONS
     */

    logNotifications(sendingId:string, sending:SendingRequest):void {
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
    sendNotifications(sendingId:string, contentLog:any):void {
        this.notificationsSrv.sendLocalNotification(sendingId, contentLog);
    }

    /**
     *  HELPERS
     */

    private setUser(){
        // set user data
        this.user = this.users.getUser();
        // set user settings
        this.users.getAccountSettings()
            .then((snapshot) => {
                this.userSettings = snapshot.val();
            }); 
    }

    private getUserDataAsOperator():Promise<any> {
        let operator:any = {};
        let profileData:UserProfileData;
        return new Promise((resolve, reject) => {
            this.users.getAccountProfileData()
                .then((snapshot) => {
                    profileData = snapshot.val();
                    // populate
                    operator.userId = this.user.uid;
                    operator.displayName = this.user.displayName;
                    operator.email = profileData.email;
                    operator.phone = profileData.phonePrefix+profileData.phoneMobile;
                    operator.photoURL = profileData.photoURL;
                    resolve(operator);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    private updateLocalSendingStages(sending:SendingRequest, stages:SendingStages):SendingRequest {
        sending._currentStage = stages._current;
        sending._currentStatus = stages[stages._current]._current;
        sending._currentStage_Status = `${sending._currentStage}_${sending._currentStatus}`;
        sending._stages = stages;
        return sending;
    }

}
