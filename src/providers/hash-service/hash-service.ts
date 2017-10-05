import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';

import Hashids from 'Hashids';

@Injectable()
export class HashService {

    hashy:any;
    userSalt:any;

    constructor(private authSrv: AuthService) {
        this.userSalt = this.authSrv.fbuser.uid;
    }

    /**
     *  HASHIDS 
     *  http://hashids.org/
     *  
     */

    /**
     *  generates a unique hashed ID based on
     * - unix seconds
     * - random(10)
     */
    genId():string {
        this.hashy = new Hashids(this.userSalt, 6, '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        let date = Date.now()/1000;
        let random1 = Math.round(date);
        let random2 = Math.floor((Math.random() * 10) + 1);          
        let hashid:string = this.hashy.encode(random1, random2);      
        return hashid;
    }

    genSecurityCode():string {
        this.hashy = new Hashids(this.userSalt, 4, '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        let random = Math.floor((Math.random() * 10) + 1);           
        let hashid:string = this.hashy.encode(random);      
        return hashid;        
    }

}
