import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { SendingStagesService } from '../sending-service/sending-stages-service';
import { HashService } from '../hash-service/hash-service';

import { SendingRequest, SENDING_CFG } from '../../models/sending-model';

const CFG = SENDING_CFG;

// storage nodes
const STRG_USER_FILES = 'userFiles/';

@Injectable()
export class SendingService {

    user: any;

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
            let flag = { created: false, imageSet: false, imageUploaded: false };
            this.writeNewSending(sending, newKey, userId)
                .then(() => {
                    console.info('writeNewSending > success');
                    flag.created = true;
                    if(sending.objectImageSet) {
                        // ImageSet: upload and save
                        flag.imageSet = true;
                        this.uploadSendingImage(newKey, sending.objectImageUrlTemp)
                            .then((snapshot) => {
                                flag.imageUploaded = true;
                                this.updateSendingImage(newKey, snapshot.downloadURL, snapshot.ref.name, snapshot.ref.fullPath);
                                console.log(flag);
                                resolve(flag);                                
                            });
                    }else{
                        // no image tu upload
                        console.log(flag);
                        resolve(flag);
                    }                    
                })               
                .catch((error) => {
                    if(flag.created) {
                        console.error('Image upload failed > ', error);
                        // do something about it ?
                        resolve(flag);
                    }else{
                        console.error('writeNewSending > error ', error);
                        reject(error);
                    }
                })
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

    private writeNewSending(sending:SendingRequest, newKey:string, userId:string):Promise<any> {  
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
