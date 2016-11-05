import { Injectable } from '@angular/core';
import { UsersService } from '../users-service/users-service';

import * as hashids from 'Hashids';

@Injectable()
export class HashService {

    hashids:any;
    user:any;
    userSalt:any;

    constructor(public users:UsersService) {
        this.user = users.getCurrentUser();
        this.userSalt = this.user.uid;
    }

    /**
     *  generates a unique hashed ID based on
     * - unix seconds
     * - random(10)
     */
    genId():string {
        this.hashids = new hashids(this.userSalt, 6, '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        let date = Date.now()/1000;
        let random1 = Math.round(date);
        let random2 = Math.floor((Math.random() * 10) + 1);          
        let hashid:string = this.hashids.encode(random1, random2);      
        return hashid;
    }

}
