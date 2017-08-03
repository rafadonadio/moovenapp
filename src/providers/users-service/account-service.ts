import { Injectable } from '@angular/core';
import { AccountProfileService } from '../users-service/account-profile-service';

@Injectable()
export class AccountServiceOld {

    constructor(public profileSrv:AccountProfileService) {
    }

    getProfileDataByUid(userId: string): firebase.Promise<any> {
        return this.profileSrv.getDataByUid(userId);
    }    

}
