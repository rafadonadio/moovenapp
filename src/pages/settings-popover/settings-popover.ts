import { UserProfileData } from '../../models/user-model';
import { Component } from '@angular/core';
import { ViewController, ModalController, NavParams } from 'ionic-angular';

import { ModalUserEditEmailPage } from '../modal-user-edit-email/modal-user-edit-email';
import { ModalUserEditPhonePage } from '../modal-user-edit-phone/modal-user-edit-phone';
import { ModalUserEditNamePage } from '../modal-user-edit-name/modal-user-edit-name';

@Component({
    templateUrl: "settings-popover.html"
})
export class SettingsPopoverPage {

    profData:UserProfileData;

    constructor(public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public params:NavParams) { 
            this.profData = params.data.profData;
        }

    close() {
        this.viewCtrl.dismiss();
    }

    presentModalEditEmail() {
        this.close();
        // show modal
        let modal = this.modalCtrl.create(ModalUserEditEmailPage, {
            profData: this.profData
        });
        modal.present();
    }

    presentModalEditPhone() {
        this.close();
        let modal = this.modalCtrl.create(ModalUserEditPhonePage, {
            profData: this.profData
        });
        modal.present();
    }

    presentModalEditName() {
        this.close();        
        let modal = this.modalCtrl.create(ModalUserEditNamePage, {
            profData: this.profData
        });
        modal.present();
    }


}
