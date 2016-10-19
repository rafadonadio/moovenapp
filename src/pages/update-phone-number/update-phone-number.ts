import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-update-phone-numbers',
    templateUrl: 'update-phone-number.html',
})
export class UpdatePhoneNumberPage {

    constructor(public navCtrl: NavController) {

    }

    goToVerifyPhone() {
        this.navCtrl.pop();
    }

}
