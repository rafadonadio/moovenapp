import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { APP_CFG } from '../../models/app-model';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {

    appName:string = APP_CFG.ENVIRONMENTS[APP_CFG.CURRENT_ENV].APP_NAME;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomePage');
    }

}
