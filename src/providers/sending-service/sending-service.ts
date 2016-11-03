import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';

import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

@Injectable()
export class SendingService {

    user: any;
    sendingsList: FirebaseListObservable<any>;

    // FIREBASE DATABASE REFERENCES
    sendingsNode = '/sendings/';
    statusNode = '/sendingsStatus/';
    progressNode = '/sendingsProgress/';

    // DATABASE
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    sendingsRef: any = firebase.database().ref(this.sendingsNode);

    constructor(private users: UsersService,
        public af: AngularFire) {
        this.setUser();
    }

    /**
     * Init sending data object
     * @return {object} [description]
     */
    init() {
        return this.getSendingObject();
    }

    create(request: any): Promise<any> {
        // set ref data
        request.ref = Math.floor((Math.random() * 10000000000) + 1);
        request.timestamp = firebase.database.ServerValue.TIMESTAMP;
        request.userUid = this.user.uid;

        // init status
        var status = this.initStatus();
        status.enabled = true;
        status.current = 'enabled';

        // set basic request data
        var userSending = {
            ref: request.ref,
            currentStatus: status.current,
            timestamp: request.timestamp,
            objectType: request.objectType,
            objectShortName: request.objectShortName,
            pickupAddressFullText: request.pickupAddressFullText,
            pickupAddressCity: request.pickupAddressCity,
            dropAddressCity: request.dropAddressCity,
            dropAddressFullText: request.dropAddressFullText,
        }

        // set db key
        var key = this.fdRef.child(this.sendingsNode).push().key;
        // save
        var updates = {};
        // save ref to user
        updates['/usersSendings/' + this.user.uid + '/active/'+ key] = userSending;
        // save status
        updates['/sendingsStatus/' + key] = status;
        // update
        updates['/sendings/' + key] = request;
        return this.fd.ref().update(updates);
    }

    /**
     * Get REF of All sendings from current user
     * @return firebase snapshots
     */
    getAllActiveRef() {
        return this.getAllMyActiveSendingsRef();
    }


    /**
     *  PRIVATE
     */ 

    // return snapshots
    private getAllMyActiveSendingsRef() {
        return this.af.database.list('/usersSendings/' + this.user.uid + '/active/', { preserveSnapshot: true });
    }

    // return list observable, 
    private getAllMyActiveSendings() {
        return this.af.database.list('/usersSendings/' + this.user.uid + '/active/');
    }    

    private setUser(){
        this.user = this.users.getCurrentUser();
    }

    private initStatus() {
        var status = {
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
        var data = {
            ref: '',
            timestamp: '',
            userUid: '',
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
