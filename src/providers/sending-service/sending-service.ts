import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { SendingStagesService } from '../sending-service/sending-stages-service';
import { HashService } from '../hash-service/hash-service';

import { SENDING_CFG, SendingRequest, SendingStages } from '../../models/sending-model';

const CFG = SENDING_CFG;

// storage nodes
const STRG_USER_FILES = 'userFiles/';

@Injectable()
export class SendingService {

    user: firebase.User;

    constructor(public users: UsersService,
        public hashSrv: HashService,
        public reqSrv: SendingRequestService,
        public dbSrv: SendingDbService,
        public stagesSrv: SendingStagesService) {
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
        let sending:SendingRequest;
        let currentStage:string;
        let currentStatus:string;
        let stages:SendingStages;
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        
        // -------------
        // run payment
        // -------------

        return new Promise((resolve, reject) => {
            this.dbSrv.getSendingbyIdOnce(sendingId)
                .then((snapshot) => {
                    console.log('getSendingbyIdOnce > success');
                    sending = snapshot.val();
                    //update CREATED to PAID and then to ENABLED
                    currentStage = CFG.STAGE.CREATED.ID;
                    currentStatus = CFG.STAGE.CREATED.STATUS.PAID;
                    stages = this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);  
                    currentStage = CFG.STAGE.CREATED.ID;
                    currentStatus = CFG.STAGE.CREATED.STATUS.ENABLED;
                    stages = this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);  
                    // update stages in database
                    return this.dbSrv.updateSendingCreatedStage(this.user.uid, sendingId, stages);
                })
                .then(() => {
                    // move CREATED to LIVE
                     
                    // update STAGE > LIVE.VACANT.
                    currentStage = CFG.STAGE.LIVE.ID;
                    currentStatus = CFG.STAGE.LIVE.STATUS.GOTOPERATOR;
                    stages = this.stagesSrv.updateStageTo(sending._stages, currentStage, currentStatus, timestamp);

                    return;
                })
                .then(() => {
                    console.log('updateSendingCreatedStages > success');
                    resolve(true);
                })
                .catch((error) => {
                    console.log('getSendingbyIdOnce OR updateSendingCreatedStages > error', error);
                    reject(error);
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
     *  DATABASE WRITE
     */ 

    private writeNewSending(sending:SendingRequest, newKey:string, userId:string):firebase.Promise<any> {  
            console.info('writeNewSending > start');
            console.log('data > ', sending, newKey, userId);
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

    private moveSendingCreatedToSendingLive(sendingId) {
        // 
        return new Promise((resolve, reject) => {

        });
    }

    /**
     *  DATABASE READ
     */

    private getMyLiveSendingsRef():any {
        return this.dbSrv.getSendingsLiveByUser(this.user.uid);
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
     *  HELPERS
     */

    private setUser(){
        this.user = this.users.getUser();
    }

}
