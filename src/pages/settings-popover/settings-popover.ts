import { Component } from '@angular/core';
import { ViewController, ModalController } from 'ionic-angular';

import { ModalUserEditEmailPage } from '../modal-user-edit-email/modal-user-edit-email';
import { ModalUserEditPhonePage } from '../modal-user-edit-phone/modal-user-edit-phone';
import { ModalUserEditNamePage } from '../modal-user-edit-name/modal-user-edit-name';

@Component({
    templateUrl: "settings-popover.html"
})
export class SettingsPopoverPage {

    constructor(public viewCtrl: ViewController,
        public modalCtrl: ModalController) { }

    close() {
        this.viewCtrl.dismiss();
    }

    presentModalEditEmail() {
        this.close();
        // show modal
        let modal = this.modalCtrl.create(ModalUserEditEmailPage);
        modal.present();
    }

    presentModalEditPhone() {
        this.close();
        let modal = this.modalCtrl.create(ModalUserEditPhonePage);
        modal.present();
    }

    presentModalEditName() {
        this.close();        
        let modal = this.modalCtrl.create(ModalUserEditNamePage);
        modal.present();
    }


}
