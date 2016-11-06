import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { UsersService } from '../users-service/users-service';
import { HashService } from '../hash-service/hash-service';

// database nodes
const DB_SENDINGS = '/sendings/';
const DB_USERS_SENDINGS = '/usersSendings/';
const DB_SENDINGS_STATUS = '/sendingsStatus/';
const DB_SENDINGS_HASHID = '/sendingsHashid/';
const DB_CHILD_ACTIVE = '/active/';
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

        /* Complete sending object */
        // gen public ID for reference
        sending.publicId = this.hashSrv.genId();
        // created  At
        sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
        // user id
        sending.userUid = this.user.uid;      
        
        /* init status */
        let status:any = this.initStatus();
        status.enabled = true;
        status.current = 'enabled';     

        /* summary for quick view */
        let summary = {
            publicId: sending.publicId,
            objectShortName: sending.objectShortName,
            timestamp: sending.timestamp,
            pickupAddress: sending.pickupAddressStreetShort + ' ' 
                            + sending.pickupAddressNumber + ', ' 
                            + sending.pickupAddressCityShort,
            dropAddress: sending.dropAddressStreetShort + ' ' 
                            + sending.dropAddressNumber + ', ' 
                            + sending.dropAddressCityShort,
        }

        // get a new db key 
        let newKey = this.fdRef.child(DB_SENDINGS).push().key;

        return new Promise((resolve, reject) => {
            this.writeNewSending(sending, summary, status, newKey)
                .then(() => {
                    console.log('1- write success ');
                    // upload image
                    if(sending.objectImageSet) {
                        console.log('2- uploadSendingImageURL > init');
                        this.uploadSendingImageURL(newKey, sending.objectImageUrl)
                            .then((result) => {
                                console.log('upload image > success', result);

                                // save image id
                                // save image URL

                                resolve();                                
                            });
                    }else{
                        // no image tu upload
                        console.log('2- no image to upload');
                        resolve('OK');
                    }                    
                })
                .catch((error) => {
                    console.log('create(), something went wrong > ', error);
                    reject(error);
                })
        });

    }

    /**
     * Get REF of All sendings from current user
     * @return firebase snapshots
     */
    getAllMyActiveRef() {
        return this.getAllMyActiveSendingsRef();
    }


    /**
     *  DATABASE
     */ 

    private writeNewSending(sending:any, summary:any, status:any, newKey:string):Promise<any> {
        console.log('writeNewSending() > init');     
        // create array with all data to write simultaneously
        let updates = {};
        // sending full object
        updates[DB_SENDINGS + newKey] = sending;        
        // sending status
        updates[DB_SENDINGS_STATUS + newKey] = status;
        // sending publicId hash reference 
        updates[DB_SENDINGS_HASHID + sending.publicId] = newKey;
        // user sending reference
        updates[DB_USERS_SENDINGS + this.user.uid + DB_CHILD_ACTIVE + newKey] = summary;
        // update and return promise
        return this.fd.ref().update(updates);
    }
 
    // return snapshots
    private getAllMyActiveSendingsRef() {
        return this.af.database
                .list(DB_USERS_SENDINGS + this.user.uid + DB_CHILD_ACTIVE, { 
                    preserveSnapshot: true,
                    query: {
                        orderByKey: true,
                    } 
                });
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
                let downloadURL = uploadTask.snapshot.downloadURL;
                let ref = uploadTask.snapshot.ref;
                resolve(uploadTask.snapshot);
                console.log('upload success > ', downloadURL, ref);
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
            dropTimeFrom: '14:00',
            dropTimeTo: '16:00',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: '',
        }
        return data;
    }

}
