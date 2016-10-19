import { Injectable } from '@angular/core';

import { UsersService } from '../users-service/users-service';

declare var firebase: any;

@Injectable()
export class SendingService {

    user: any;

    constructor(private users: UsersService) {
        this.setUser();
    }

    // FIREBASE DATABASE REFERENCES
    sendingsNode = '/sendings/';
    statusNode = '/sendingsStatus/';
    progressNode = '/sendingsProgress/';

    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    sendingsRef: any = firebase.database().ref(this.sendingsNode);

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
     * @return {[type]} [description]
     */
    getAllActiveRef() {
        console.log('sendings.getAllActiveRef > user uid > ', this.user.uid);
        return this.fd.ref('/usersSendings/' + this.user.uid + '/active/');
    }

    /**
     *  PRIVATE
     */

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
            objectShortName: '',
            objectImageSet: '',
            objectImageUrl: '',
            objectType: '',
            objectNoValueDeclared: false,
            objectDeclaredValue: 0,
            pickupAddressFullText: '',
            pickupAddressStreet: '',
            pickupAddressNumber: '',
            pickupAddressCity: '',
            pickupAddressZipcode: '',
            pickupLat: '',
            pickupLng: '',
            pickupDate: '',
            pickupTimeFrom: '',
            pickupTimeTo: '',
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
            dropTimeFrameFrom: '',
            dropTimeFrameTo: '',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: ''
        }
        return data;
    }

}
