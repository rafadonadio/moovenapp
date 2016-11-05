import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { UsersService } from '../users-service/users-service';
import { HashService } from '../hash-service/hash-service';

// database nodes
const DB_SENDINGS = '/sendings/';
const DB_USERS_SENDINGS = '/usersSendings/';
const DB_SENDINGS_STATUS = '/sendingsStatus/';
const DB_SENDINGS_HASHID = '/sendingsHashid/';
// storage nodes
const STRG_USER_FILES = '/userFiles/';

@Injectable()
export class SendingService {

    user: any;
    sendingsList: FirebaseListObservable<any>;

    // DATABASE
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    sendingsRef: any = firebase.database().ref(DB_SENDINGS);

    constructor(public users: UsersService,
        public af: AngularFire,
        public hashSrv: HashService) {
        this.setUser();
    }

    /**
     * Init sending data object
     * @return {object} [description]
     */
    init() {
        return this.getSendingObject();
    }

    create(sending:any):Promise<any> {
        console.log('create() > init');
        // set db reference
        sending.publicId = this.hashSrv.genId();
        // aditional values
        sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
        sending.userUid = this.user.uid;

        // init status
        let status = this.initStatus();
        status.enabled = true;
        status.current = 'enabled';

        // set basic sending data
        let userSending = {
            publicId: sending.publicId,
            objectShortName: sending.objectShortName,
            timestamp: sending.timestamp,
            pickupAddress: sending.pickupAddressStreetShort + ' ' + sending.pickupAddressNumber + ', ' + sending.pickupAddressCityShort,
            dropAddress: sending.dropAddressStreetShort + ' ' + sending.dropAddressNumber + ', ' + sending.dropAddressCityShort,
        }       
        // set db key
        let key = this.fdRef.child(DB_SENDINGS).push().key;

        // upload image
        if(this.sendingsRef.objectImageSet) {
            this.uploadSendingImageURL(key, this.sendingsRef.objectImageUrl)
                .then((result) => {
                    console.log(result);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        // save
        let updates = {};
        // save ref to user
        updates[DB_USERS_SENDINGS + this.user.uid + '/active/'+ key] = userSending;
        // save status
        updates[DB_SENDINGS_STATUS + key] = status;
        // save publicid > hashid
        updates[DB_SENDINGS_HASHID + sending.publicId] = key;
        // update
        updates[DB_SENDINGS + key] = sending;
        return this.fd.ref().update(updates);
    }

    /**
     * Get REF of All sendings from current user
     * @return firebase snapshots
     */
    getAllMyActiveRef() {
        return this.getAllMyActiveSendingsRef();
    }

    /**
     *  STORAGE
     */

    uploadSendingImageURL(sendingId:string, imageURL: string): Promise<any> {
        console.group('uploadSendingImageURL');
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.user.uid).child(sendingId)
                    .putString(imageURL, 'base64', {contentType: 'image/jpeg'});
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
                let downloadURL = uploadTask.snapshot.downloadURL;
                let ref = uploadTask.snapshot.ref;
                console.log('success > ', downloadURL, ref);
                console.groupEnd();                
            });
        });
    }


    /**
     *  PRIVATE
     */ 

    // return snapshots
    private getAllMyActiveSendingsRef() {
        return this.af.database.list(DB_USERS_SENDINGS + this.user.uid + '/active/', { preserveSnapshot: true });
    }  

    private setUser(){
        this.user = this.users.getCurrentUser();
    }

    private initStatus() {
        let status = {
            current: '',
            enabled: false,
            payment: false,
            shipper: false,
            pickup: false,
            drop: false
        }
        return status;
    }
    private getSendingObject(): any {
        let data = {
            publicId: '',
            timestamp: '',
            userUid: '',
            price: 0,   
            priceMinFareApplied: false,               
            routeDistanceMt: 0,
            routeDistanceKm: 0,
            routeDistanceTxt: '',
            routeDurationMin: 0,
            routeDurationTxt: '',      
            objectShortName: '',
            objectImageSet: false,
            objectImageUrl: '',
            objectType: '',
            objectNoValueDeclared: false,
            objectDeclaredValue: 0,
            pickupAddressSet: false,
            pickupAddressIsComplete: false,
            pickupAddressUserForcedValidation: false,
            pickupAddressPlaceId: '',
            pickupAddressLat: '',
            pickupAddressLng: '',            
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
            dropAddressSet: false,
            dropAddressIsComplete: false,
            dropAddressUserForcedValidation: false,
            dropAddressPlaceId: '',
            dropAddressLat: '',
            dropAddressLng: '',            
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
            dropTimeFrom: '09:00',
            dropTimeTo: '11:00',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: '',
        }
        return data;
    }

}
