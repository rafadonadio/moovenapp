import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { VerifyPhonePage } from '../verify-phone/verify-phone';

@Component({
    templateUrl: 'update-phone-number.html',
})
export class UpdatePhoneNumberPage {

    constructor(public navCtrl: NavController) {

    }

    goToVerifyPhone() {
        this.navCtrl.pop();
    }

}
