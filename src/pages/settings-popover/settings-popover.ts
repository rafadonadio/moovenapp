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

    accountData:UserProfileData;

    constructor(public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public params:NavParams) { 
            this.accountData = params.data.accountData;
        }

    close(update:boolean = false) {
        console.info('closing popover');
        let data = {
            update: update
        };
        this.viewCtrl.dismiss(data);
    }

    presentModalEditEmail() {
        let modal = this.modalCtrl.create(ModalUserEditEmailPage, {
            accountData: this.accountData
        });
        modal.present(); 
        modal.onDidDismiss(data => {
            console.info('closing modal edit name > updated ', data.update);
            this.close(data.update);
        });              
    }

    presentModalEditPhone() {
        let modal = this.modalCtrl.create(ModalUserEditPhonePage, {
            accountData: this.accountData
        });
        modal.present();
        modal.onDidDismiss(data => {
            console.info('closing modal edit name > updated ', data.update);
            this.close(data.update);
        });           
    }

    presentModalEditName() {      
        let modal = this.modalCtrl.create(ModalUserEditNamePage, {
            accountData: this.accountData
        });
        modal.present();
        modal.onDidDismiss(data => {
            console.info('closing modal edit name > updated ', data.update);
            this.close(data.update);
        });           
    }


}
