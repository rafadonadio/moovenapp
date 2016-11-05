import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import { UsersService } from '../users-service/users-service';
import { HashService } from '../hash-service/hash-service';

// database nodes
const DB_SENDINGS = '/sendings/';
const DB_USERSENDINGS = '/usersSendings/';
const DB_SENDINGSSTATUS = '/sendingsStatus/';
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
        // set db reference
        sending.publicId = this.hashSrv.genId();
        // aditional values
        sending.timestamp = firebase.database.ServerValue.TIMESTAMP;
        sending.userUid = this.user.uid;

        // init status
        var status = this.initStatus();
        status.enabled = true;
        status.current = 'enabled';

        // set basic sending data
        var userSending = {
            ref: sending.ref,
            currentStatus: status.current,
            timestamp: sending.timestamp,
            dropAddressCity: sending.dropAddressCityLong,
            dropAddressFullText: sending.dropAddressFullText,
        }

        // set db key
        var key = this.fdRef.child(DB_SENDINGS).push().key;
        // save
        var updates = {};
        // save ref to user
        updates[DB_USERSENDINGS + this.user.uid + '/active/'+ key] = userSending;
        // save status
        updates[DB_SENDINGSSTATUS + key] = status;
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

    uploadSendingImage() {

    }

    /**
     *  PRIVATE
     */ 

    // return snapshots
    private getAllMyActiveSendingsRef() {
        return this.af.database.list(DB_USERSENDINGS + this.user.uid + '/active/', { preserveSnapshot: true });
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
            objectImageSet: '',
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
            dropAddressFullText: '',
            dropAddressStreet: '',
            dropAddressNumber: '',
            dropAddressCity: '',
            dropAddressZipcode: '',
            dropLat: '',
            dropLng: '',
            dropDate: '',
            dropTimeFrom: '14:00',
            dropTimeTo: '16:00',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: ''
        }
        return data;
    }

}
