import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';

// import Hashids from 'Hashids';
import * as shortid from 'shortid';

@Injectable()
export class HashService {

    userSalt:any;

    constructor(private authSrv: AuthService) {
        // this.userSalt = this.authSrv.fbuser.uid;
    }   

    /**
     *  generates a unique hashed ID based shortid
     *  https://www.npmjs.com/package/shortid
     */
    genId():string {
        return shortid.generate(); 
    }

    genSecurityCode():string {
        let length = 4;
        let code = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for(var i = 0; i < length; i++) {
            code += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return code;        
    }

}
