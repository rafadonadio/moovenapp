import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { UsersService } from '../users-service/users-service';
import { HashService } from '../hash-service/hash-service';

// database childs   
const DB_CHILD_ACTIVE = '_active/';                          // status: created, vacant, holdforpickup, intransit, completed  
const DB_CHILD_INACTIVE = 'inactive/';
const DB_CHILD_STATUS_LOG = 'statusLog/';                    
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
const DB_SENDINGS_STATUS_UPDATES_LOG = 'sendingsStatusUpdatesLog/';      // log all updates (triplicate in sendings and user)
// shipper view
const DB_SENDINGS_VACANT = '_sendingsVacant/';               // status: vacant > shipper view

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
        let statusObj:any = this.initStatus();
        let newStatus = 'vacant';
        statusObj = this.setStatus(statusObj, newStatus);   

        /* Complete sending object */
        // gen public ID for reference
        sending.publicId = this.hashSrv.genId();
        // created  At
        sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
        // user id
        sending.userUid = this.user.uid;
        // status
        sending.status = statusObj;             
        
        /* summary for quick view and avoid db joins */
        let summary = this.setSendingSummary(sending, statusObj.current);

        // get a new db key 
        let newKey = this.fdRef.child(DB_SENDINGS).push().key;

        return new Promise((resolve, reject) => {
            this.writeNewSending(sending, summary, newKey)
                .then(() => {
                    console.log('1- write success ');
                    this.logSendingStatusUpdate(newKey, '', newStatus);
                    // upload image
                    if(sending.objectImageSet) {
                        console.log('2- uploadSendingImageURL > init');
                        this.uploadSendingImageURL(newKey, sending.objectImageUrl)
                            .then((snapshot) => {
                                console.info('1.b- upload image > success');
                                console.log('url > ', snapshot.downloadURL);
                                console.log('ref > ', snapshot.ref.name, snapshot.ref.fullPath, );                               
                                // save image URL, name, fullpath 
                                this.updateSendingImage(newKey, snapshot.downloadURL, snapshot.ref.name, snapshot.ref.fullPath);
                                resolve();                                
                            });
                    }else{
                        // no image tu upload
                        console.log('no image to upload');
                        resolve('OK');
                    }                    
                })
                // .then(() => {
                //     console.log('2- process payment and set status to enabled');
                //     this.updateSendingStatusToEnabled(newKey, statusObj)
                //         .then(() => {
                //             console.log('3- set status to vacant');

                //         });
                // })                
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

    getSending(id:string) {
        return this.getSendingById(id);
    }


    /**
     *  DATABASE WRITE
     */ 

    // private updateSendingStatusToEnabled(sendingId:any, statusObj:any):Promise<any> {
    //     let newStatus = 'enabled';
    //     this.logSendingStatusUpdate(sendingId, statusObj.current, newStatus);        
    //     statusObj = this.setStatus(statusObj, newStatus);        
    //     let updates = {};
    //     // update sendings
    //     updates[DB_SENDINGS + sendingId + '/status/'] = statusObj;
    //     // update _sendingsCreated
    //     updates[DB_SENDINGS_CREATED + sendingId + '/currentStatus/'] = newStatus;
    //     // update userSendings
    //     updates[DB_USERS_SENDINGS + this.user.uid + '/_active/' + sendingId + '/currentStatus/'] = newStatus;
    //     // update and return promise
    //     return this.fd.ref().update(updates);        
    // }

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
        updates[DB_SENDINGS_VACANT + newKey] = summary;
        // user active sendings reference
        updates[DB_USERS_SENDINGS + this.user.uid + '/' + DB_CHILD_ACTIVE + newKey] = summary;
        // update and return promise
        return this.fd.ref().update(updates);
    }
 
    private logSendingStatusUpdate(sendingId:any, OldStatus:any, newStatus:any, relatedData:any = {}):void {
        console.log('logSendingStatusUpdate');
        // timestamp 
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        // set data        
        let data = {
            sendingId: sendingId,
            oldStatus: OldStatus,
            newStatus: newStatus,
            timestamp: timestamp,
            relatedData: relatedData
        }
        let updates = {};
        // write to log
        updates[DB_SENDINGS_STATUS_UPDATES_LOG + sendingId + '/' + newStatus] = data;
        // write timestamp change to sending
        updates[DB_SENDINGS + sendingId + '/' + DB_CHILD_STATUS_LOG + newStatus] = timestamp;     
        this.fd.ref().update(updates)
            .then(()=>{
                console.log('logSendingStatusUpdate > success');
            })
            .catch((error) => {
                console.log('logSendingStatusUpdate > error > ', error);
            });
    }

    private updateSendingImage(sendingId, downloadURL, imageName, imageFullpathRef):void {
        console.log('updateSendingImage > init');
        let updates = {};
        updates[DB_SENDINGS + sendingId + '/objectImageDownloadUrl/'] = downloadURL;
        updates[DB_SENDINGS + sendingId + '/objectImageName/'] = imageName;
        updates[DB_SENDINGS + sendingId + '/objectImageFullPathRef/'] = imageFullpathRef;
        // delete objectImageURL because we already uploaded to storage
        updates[DB_SENDINGS + sendingId + '/objectImageUrl/'] = '';        
        this.fd.ref().update(updates)
            .then(()=>{
                console.log('updateSendingImage > success');
            })
            .catch((error) => {
                console.log('updateSendingImage > error > ', error);
            });        
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

    private getSendingById(sendingId:string) {
        return this.af.database.object(DB_SENDINGS + sendingId, {
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
            objectImageUrl: '', // temp, this must be deleted once uploaded
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
                resolve(uploadTask.snapshot);
                console.log('uploadSendingImageURL > success');
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
