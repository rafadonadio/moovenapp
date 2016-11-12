import { Injectable } from '@angular/core';

import { AngularFire } from 'angularfire2';

@Injectable()
export class ProfileService {

    // FIREBASE DATABASE REFERENCES
    node = '/usersProfile/';
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    usersProfileRef: any = firebase.database().ref(this.node);


    constructor(public af:AngularFire) {

    }

    /**
     *  SETTERS
     */

    // init profile data
    initProfileData(): any {
        var profile = {
            firstName: '',
            lastName: '',
            phonePrefix: '',
            phoneMobile: '',
            photoURL: ''
        };
        return profile;
    }

    // update user profile (updates only the included nodes)
    update(userId: string, data: any): any {
        var profileData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phonePrefix: data.phonePrefix,
            phoneMobile: data.phoneMobile
            //***photoURL > update in separate method***
        };
        var updates = {};
        for(let key in profileData) {
            updates['/usersProfile/' + userId + '/'+ key +'/'] = profileData[key];
        }
        return this.fd.ref().update(updates);
    }


    /**
     *  GETTERS
     */

    // get user profile from firebase database
    getByUid(userId: string): Promise<any> {
        return this.fd.ref(this.node + userId).once('value');
    }


    /**
     *  HELPERS
     */

    isBasicComplete(profileData: any) {
        return profileData.firstName!=='' && profileData.lastName!=='' && profileData.phoneMobile!=='';
    }

    isImageComplete(profileData: any) {
        return (typeof profileData.photoURL !== 'undefined') && profileData.photoURL!==null && profileData.photoURL!=='';
    }

}
