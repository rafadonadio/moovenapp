import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';

declare var window:any;

@Component({
    selector: 'page-start',
    templateUrl: 'start.html',
})
export class StartPage {

    constructor(public navCtrl: NavController,
        public storage: Storage) {
            this.removeAnyExistingSessionData();
    }

    goToLogin() {
    	this.navCtrl.push(LoginPage);
    }

    goToSignup() {
    	this.navCtrl.push(SignupPage);
    }

    removeAnyExistingSessionData() {
        this.storage.ready().then(() => {
            this.storage.get('firebase:host:mooven-f9e3c.firebaseio.com')
                .then((val) => {
                    console.log(this.storage.driver);
                    console.log('fb data', val);
                });
        });
        console.log(window.localStorage.getItem("firebase:host:mooven-f9e3c.firebaseio.com"));
    }
}
