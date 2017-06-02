import { StorageService } from '../storage-service/storage-service';
import { HashService } from '../hash-service/hash-service';
import { SendingDbService } from './sending-db-service';
import { SendingRequest } from '../../models/sending-model';
import { Injectable } from '@angular/core';

@Injectable()
export class SendingCreateService{

    sending: SendingRequest;
    taskCF: any; // cloud function task data
    userId: string;
    dbRef: firebase.database.Reference;

    constructor(private dbSrv: SendingDbService,
        private hashSrv: HashService,
        private storageSrv: StorageService) {}

    // create sending
    run(sending:SendingRequest, userId:string): Promise<any> {
        this.setDbRef();
        this.sending = sending;
        this.userId = userId;
        return this.create();
    }


    /**
     *  METHODS
     */

    private create():Promise<SendingRequest> {
        console.info('__CRS__ create sending');
        // populate
        this.setPublicId();
        this.setTimestamp();
        this.setUserId();
        // security codes
        this.setPickupSecurityCode()
        this.setDropSecurityCode();
        // uid
        this.setSendingId();
        // upload sending image
        // write sending to db
        // CF >> set task, init stage status, log notification (CF)
        return new Promise((resolve, reject) => {
            this.uploadImage()
                .then(result => {
                    console.log('uploadImage result', result);
                    // if image uploaded, update sending
                    if(result.imageSet && result.uploaded) {
                        this.setSendingImageUploadedData(result);
                    }
                    this.setTaskCF();
                    return this.writeToDb();
                })
                .then(result => {
                    console.log('writeToDb success', result);
                    resolve(this.sending);
                })
                .catch(error => {
                    console.log('__CRS__', error)
                    reject(error);
                });
        });
    }


    /**
     *  STORAGE
     */

    private getStorageRef() {
        return this.storageSrv.getSendingImageRef(this.userId, this.sending.sendingId);
    }

    private getImageFormatAndType() {
        let data = this.storageSrv.getImageStringFormatAndType();
        return data;
    }

    private isImageSet() {
        return this.sending.objectImageSet;
    }

    private uploadImage():  Promise<any> {
        //console.info('uploadImage');
        let result = {
            imageSet: null,
            uploaded: null,
            imageUrl: null,
            imageName: null,
            fullPath: null,
            error: null
        }
        if(!this.isImageSet()) {
            // no image to upload
            result.imageSet = false;
            return Promise.resolve(result);
        }
        result.imageSet = true;
        // image is set, upload
        let format = this.getImageFormatAndType().format;
        let type = this.getImageFormatAndType().type;
        let imageDataURL = this.sending.objectImageUrlTemp;
        let storageRef = this.getStorageRef();
        let uploadTask = storageRef.putString(imageDataURL, format, {contentType: type});
        return new Promise((resolve, reject) => {
            // upload
            uploadTask.on('state_changed', function(snapshot) {
                    //let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    //console.info('Upload is ' + progress + '% done');
                }, function (error:any) {
                    //console.log('failed > ', error.code);
                    result.uploaded = false;
                    result.error = error;
                    reject(result);
                }, function() {
                    // success
                    result.uploaded = true;
                    result.imageUrl = uploadTask.snapshot.downloadURL;
                    result.imageName = uploadTask.snapshot.ref.name;
                    result.fullPath = uploadTask.snapshot.ref.fullPath;
                    //console.log('uploadImage > success');
                    resolve(result);
            });
        });
    }



    /**
     *  DATABASE
     */
    
    private setDbRef() {
        this.dbRef = this.dbSrv.getDatabaseRef();
        console.log('init dbRef', this.dbRef);
    }

    private writeToDb() {
        //console.info('writeToDb');
        let updates = {};
        // write sending
        updates[`sendings/${this.sending.sendingId}`] = this.sending;
        // write cf task
        let taskKey = this.dbSrv.newSendingTaskKey();
        updates[`sendingsTask/${taskKey}`] = this.taskCF;
        return this.dbRef.update(updates);
    }

    /**
     *  CLOUD FUNCTION TASK
     */
    
    // set task for Cloud Functions
    private setTaskCF() {
        this.taskCF = {
            sendingId: this.sending.sendingId,
            task: 'set_registered',
            timestamp: this.dbSrv.getTimestamp(),
            origin: 'app'
        }
    }


    /**
     *  HELPERS
     */

    private setPublicId() {
        this.sending.publicId = this.hashSrv.genId();
    }

    private setTimestamp() {
        this.sending.timestamp = this.dbSrv.getTimestamp();
    }

    private setUserId() {
        this.sending.userUid = this.userId;
    }

    private setPickupSecurityCode() {
        this.sending.pickupSecurityCode = this.hashSrv.genSecurityCode();
    }

    private setDropSecurityCode() {
        this.sending.dropSecurityCode = this.hashSrv.genSecurityCode();
    }

    private setSendingId() {
        this.sending.sendingId = this.dbSrv.newSendingKey();
    }

    private setSendingImageUploadedData(uploadResult) {      
        this.sending.objectImageDownloadUrl = uploadResult.imageUrl;
        this.sending.objectImageName = uploadResult.imageName;
        this.sending.objectImageFullPathRef = uploadResult.fullPath;
        // reset temp
        this.sending.objectImageUrlTemp = '';
    }

    /**
     *  INIT
     */

    new():SendingRequest {
        let data:SendingRequest = {
            sendingId: '',
            publicId: '',
            timestamp: 0,
            userUid: '',         
            price: 0,   
            priceMinFareApplied: false,
            priceItems: [],               
            routeDistanceMt: 0,
            routeDistanceKm: 0,
            routeDistanceTxt: '',
            routeDurationMin: 0,
            routeDurationTxt: '',
            objectShortName: '',
            objectImageSet: false,
            objectImageUrlTemp: '',
            objectImageDownloadUrl: '',
            objectImageName: '',
            objectImageFullPathRef: '',
            objectType: '',
            objectNoValueDeclared: false,
            objectDeclaredValue: 0,
            pickupAddressSet: false,
            pickupAddressIsComplete: false,
            pickupAddressUserForcedValidation: false,
            pickupAddressPlaceId: '',
            pickupAddressLat: 0,
            pickupAddressLng: 0,            
            pickupAddressFullText: '',
            pickupAddressLine2: '',
            pickupAddressStreetShort: '',
            pickupAddressStreetLong: '',
            pickupAddressNumber: '',
            pickupAddressPostalCode: '',
            pickupAddressCityAreaShort: '',
            pickupAddressCityAreaLong: '',            
            pickupAddressCityShort: '',
            pickupAddressCityLong: '',
            pickupAddressStateAreaShort: '',
            pickupAddressStateAreaLong: '',            
            pickupAddressStateShort: '',
            pickupAddressStateLong: '',
            pickupAddressCountry: '',
            pickupDate: '',
            pickupTimeFrom: '09:00',
            pickupTimeTo: '11:00',
            pickupPersonName: '',
            pickupPersonPhone: '',
            pickupPersonEmail: '',
            pickupSecurityCode: '',
            dropAddressSet: false,
            dropAddressIsComplete: false,
            dropAddressUserForcedValidation: false,
            dropAddressPlaceId: '',
            dropAddressLat: 0,
            dropAddressLng: 0,            
            dropAddressFullText: '',
            dropAddressLine2: '',
            dropAddressStreetShort: '',
            dropAddressStreetLong: '',
            dropAddressNumber: '',
            dropAddressPostalCode: '',
            dropAddressCityAreaShort: '',
            dropAddressCityAreaLong: '',            
            dropAddressCityShort: '',
            dropAddressCityLong: '',
            dropAddressStateAreaShort: '',
            dropAddressStateAreaLong: '',            
            dropAddressStateShort: '',
            dropAddressStateLong: '',
            dropAddressCountry: '',
            dropDate: '',
            dropTimeFrom: '14:00',
            dropTimeTo: '16:00',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: '',
            dropSecurityCode: ''
        }
        return data;
    }

}