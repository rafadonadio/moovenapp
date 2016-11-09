import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingRequestService } from '../sending-service/sending-request-service';
import { SendingStatusService } from '../sending-service/sending-status-service';
import { SendingStageService } from '../sending-service/sending-stage-service';
import { HashService } from '../hash-service/hash-service';

import { SendingRequest } from '../../shared/sending-interface';


// storage nodes
const STRG_USER_FILES = 'userFiles/';

@Injectable()
export class SendingService {

    user: any;

    constructor(public users: UsersService,
        public hashSrv: HashService,
        public reqSrv: SendingRequestService,
        public dbSrv: SendingDbService,
        public statusSrv: SendingStatusService,
        public stageSrv: SendingStageService) {
        this.setUser();
    }

    /**
     * Init sending data object
     * @return {object} [description]
     */
    initRequest() {
        this.reqSrv.init();
        return this.reqSrv.request;
    }

    create(sending:SendingRequest):Promise<any> {
        console.info('create() > start');
        /* aux */
        let publicIdHash = this.hashSrv.genId();
        let timestamp = this.dbSrv.getTimestamp();
        let userId = this.user.uid;
        let newStage = this.stageSrv.STAGE.CREATED; 

        this.stageSrv.init();
        sending.stages = this.stageSrv.stages;
        this.statusSrv.init();        
        sending.statuses = this.statusSrv.statuses;   
        /* process */
        console.log('pre process', sending.statuses);
        this.stageSrv.populateStage(newStage, timestamp);
        this.statusSrv.updateForCurrentStage(newStage, timestamp);
        console.log('post process', sending.statuses);

        /* complete */
        sending.publicId = publicIdHash;
        sending.timestamp = timestamp;
        sending.userUid = userId;
        sending.currentStatus = this.statusSrv.getCurrent();

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

    private writeNewSending(
        sending:SendingRequest, 
        newKey:string, 
        userId:string):Promise<any> {  
            console.info('writeNewSending > start');
            let dbList = this.dbSrv.AUX_LIST.CREATED;
            let summary:any = this.reqSrv.getSummaryForDbList(sending, dbList);
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

    uploadSendingImage(sendingId:string, imageURL: string): Promise<any> {
        console.group('uploadSendingImage');
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.user.uid)
                    .child(sendingId)
                    .putString(imageURL, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
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
        this.user = this.users.getCurrentUser();
    }

}
