import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';

@Component({
    templateUrl: 'start.html',
})
export class StartPage {

    constructor(private navCtrl: NavController) {

    }

    goToLogin() {
    	this.navCtrl.push(LoginPage);
    }

    goToSignup() {
    	this.navCtrl.push(SignupPage);
    }
}
