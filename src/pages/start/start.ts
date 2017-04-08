import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';

declare var window:any;

@Component({
    selector: 'page-start',
    templateUrl: 'start.html',
})
export class StartPage {
    constructor(public navCtrl: NavController) {}

    goToLogin() {
    	this.navCtrl.push(LoginPage);
    }

    goToSignup() {
    	this.navCtrl.push(SignupPage);
    }

}
