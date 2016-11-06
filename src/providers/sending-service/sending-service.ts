import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { UsersService } from '../users-service/users-service';
import { HashService } from '../hash-service/hash-service';

// database childs   
const DB_CHILD_ACTIVE = '_active/';                          // status: created, vacant, holdforpickup, intransit, completed  
const DB_CHILD_INACTIVE = 'inactive/';                       // status: the rest
// database nodes
const DB_SENDINGS = 'sendings/';
const DB_SENDINGS_HASHID_MAP = 'sendingsHashid/';
const DB_USERS_SENDINGS = 'usersSendings/'; 
// management
const DB_SENDINGS_CREATED = '_sendingsCreated/';            // status: created, not enabled (when enabled set live and vacant)    
//const DB_SENDINGS_LIVE = '_sendingsLive/';                // status: vacant, holdforpickup, intransit
//const DB_SENDINGS_EXPIRED = 'sendingsExpired/';           // status: expired (vacant not assigned to shipper)
//const DB_SENDINGS_COMPLETED = 'sendingsCompleted/';       // status: active that has been completed
//const DB_SENDINGS_UNCONCLUDED = 'sendingsUnconcluded/';   // status: active unconcluded
const DB_SENDINGS_UPDATES_LOG = 'sendingsUpdatesLog/';      // log all updates (triplicate in sendings and user)
// shipper view
//const DB_SENDINGS_VACANT = '_sendingsVacant/';               // status: vacant > shipper view

// storage nodes
const STRG_USER_FILES = 'userFiles/';

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

        /* init status */
        let status:any = this.initStatus();
        let newStatus = 'created';
        status = this.setStatus(status, newStatus);   

        /* Complete sending object */
        // gen public ID for reference
        sending.publicId = this.hashSrv.genId();
        // created  At
        sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
        // user id
        sending.userUid = this.user.uid;
        // status
        sending.status = status;             
        
        /* summary for quick view and avoid db joins */
        let summary = this.setSendingSummary(sending, status.current);

        // get a new db key 
        let newKey = this.fdRef.child(DB_SENDINGS).push().key;

        return new Promise((resolve, reject) => {
            this.writeNewSending(sending, summary, newKey)
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
                .then(() => {
                    console.log('set payment');
                })
                .then(() => {
                    console.log('set sending as vacant');
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
        return this.getMyLiveSendingsRef();
    }


    /**
     *  DATABASE WRITE
     */ 

    private writeNewSending(sending:any, summary:any, newKey:string):Promise<any> {
        console.log('writeNewSending() > init');     
        // create array with all data to write simultaneously
        let updates = {};
        // sending full object
        updates[DB_SENDINGS + newKey] = sending;        
        // sending publicId hash reference 
        updates[DB_SENDINGS_HASHID_MAP + sending.publicId] = newKey;
        /* Duplicates */
        // sending status
        updates[DB_SENDINGS_CREATED + newKey] = summary;
        // user active sendings reference
        updates[DB_USERS_SENDINGS + this.user.uid + '/' + DB_CHILD_ACTIVE + newKey] = summary;
        // update and return promise
        return this.fd.ref().update(updates);
    }
 

    /**
     *  DATABASE READ
     */

    // return snapshots
    private getMyLiveSendingsRef() {
        return this.af.database
                .list(DB_USERS_SENDINGS + this.user.uid + '/' + DB_CHILD_ACTIVE, { 
                    preserveSnapshot: true,
                });
    }  


    /**
     *  SENDING STATUS
     */

    private setSendingSummary(sending:any, currentStatus:string):any {
        let summary:any = {}
        // base
        summary = {
            publicId: sending.publicId,
            objectShortName: sending.objectShortName,
            timestamp: sending.timestamp,
            currentStatus: currentStatus              
        };
        switch(currentStatus) {         
            case 'created':
            case 'enabled':
            case 'vacant':
                summary.pickupAddress = this.getSendingPickupAddressSummary(sending);
                summary.pickupAddressLatLng = this.getSendingPickupLatLng(sending);                          
                summary.dropAddress = this.getSendingDropAddressSummary(sending);
                summary.dropAddressLatLng = this.getSendingDropLatLng(sending);
                break;
            case 'expired':

                break;
            case 'holdforpickup':

                break;
            case 'intransit':

                break;                
            case 'canceled':
            case 'completed':
            case 'archived':

                break;         
            case 'unconcluded':

                break;                                                                       
        }
        return summary;
    }

    private setStatus(sendingStatus:any, newStatus:string) {
        console.log('setStatus() > new > ', newStatus);
        // flag
        let statusNotFound:boolean = false;    
        switch(newStatus) {
            case 'created': // created 
                    sendingStatus.created = true;
                break;
            case 'enabled':
                    sendingStatus.enabled = true;
                break;
            case 'vacant':   
                    sendingStatus.vacant = true;
                break;
            case 'expired':   
                    sendingStatus.vacant = false;
                    sendingStatus.expired = true;
                break;
            case 'holdforpickup':  
                    sendingStatus.vacant = false;
                    sendingStatus.holdforpickup = true;
                break;
            case 'intransit':               
                    sendingStatus.holdforpickup = false;
                    sendingStatus.intransit = true;
                break;
            case 'completed':
                    sendingStatus.intransit = false;
                    sendingStatus.completed = true;                                
                break;         
            case 'archived':
                    sendingStatus.archived = true;                                
                break;  
            case 'canceled':
                    sendingStatus.vacant = false;
                    sendingStatus.holdforpickup = false;
                    sendingStatus.intransit = false;
                    sendingStatus.completed = false;
                    sendingStatus.canceled = true;
                    sendingStatus.unconcluded = false;                                  
                break;
            case 'unconcluded':
                    sendingStatus.completed = false;
                    sendingStatus.canceled = false;
                    sendingStatus.unconcluded = true;                                  
                break;                                                                       
            default:
                statusNotFound = true;
        }      
        // set current     
        if(statusNotFound===false){
            sendingStatus.current = newStatus;              
        }else{
            console.error('setStatus() > newStatus not found')
        }
        return sendingStatus;        
    }

    private initStatus() {
        let status = {
            current: '',
            // initial states
            created: false,
            enabled: false,
            vacant: false,
            expired: false,
            // in progress states
            holdforpickup: false,
            intransit: false,
            completed: false,
            archived: false,
            // issues states
            canceled: false,
            unconcluded: false,            
        }
        return status;
    }

    /**
     *  SENDING OBJECT
     */

    private getSendingPickupAddressSummary(sending:any) {
        return sending.pickupAddressStreetShort 
                + ' ' 
                + sending.pickupAddressNumber + ', ' 
                + sending.pickupAddressCityShort;
    }

    private getSendingDropAddressSummary(sending:any) {
        return sending.dropAddressStreetShort 
                + ' ' 
                + sending.dropAddressNumber + ', ' 
                + sending.dropAddressCityShort;
    }    

    private getSendingPickupLatLng(sending:any) {
        return { lat: sending.pickupAddressLat, lng: sending.pickupAddressLng };
    }

    private getSendingDropLatLng(sending:any) {
        return { lat: sending.dropAddressLat, lng: sending.dropAddressLng };
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
            status: {},      
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


    /**
     *  STORAGE UPLOAD
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

}
