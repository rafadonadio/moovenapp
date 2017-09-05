import { StorageService } from '../storage-service/storage-service';
import { HashService } from '../hash-service/hash-service';
import { SendingRequest } from '../../models/sending-model';
import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class SendingCreateService{

    sending: SendingRequest;
    taskCF: any; // cloud function task data
    userId: string;
    dbRef: firebase.database.Reference;

    constructor(private hashSrv: HashService,
        private storageSrv: StorageService) {}

    // create sending
    run(sending:SendingRequest, userId:string): Promise<any> {
        this.setDbRef();
        this.sending = sending;
        this.userId = userId;
        return this.create();
    }

    new() {
        return this.getNew();
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
                    return this.setTasksAndWrite();
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
        this.dbRef = firebase.database().ref();
    }

    private setTasksAndWrite() {
        let task = 'set_registered';
        let origin = 'app';
        let setBy = 'sender';
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let taskKey = this.dbRef.child('sendingsTask/').push().key;
        this.taskCF = {
            task: task,
            origin: origin,
            setBy: setBy,
            sendingId: this.sending.sendingId,
            sendingUserid: this.userId,
            timestamp: timestamp,
        }
        //console.info('writeToDb');
        let updates = {};
        // write sending
        updates[`sendings/${this.sending.sendingId}`] = this.sending;
        // write cf task
        updates[`sendingsTask/${taskKey}`] = this.taskCF;
        // write task to sending
        return this.dbRef.update(updates);
    }

    /**
     *  HELPERS
     */

    private setPublicId() {
        this.sending.publicId = this.hashSrv.genId();
    }

    private setTimestamp() {
        this.sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
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
        this.sending.sendingId = this.dbRef.child('sendings/').push().key;
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

    private getNew():SendingRequest {
        let data:SendingRequest = {
            sendingId: '',
            publicId: '',
            timestamp: 0,
            userUid: '',         
            price: 0,
            priceCurrencyId: 'ARS',   
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
            pickupTimeFrom: '',
            pickupTimeTo: '',
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
            dropTimeFrom: '',
            dropTimeTo: '',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: '',
            dropSecurityCode: ''
        }
        return data;
    }

}