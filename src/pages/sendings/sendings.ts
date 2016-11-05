import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingDetailPage } from '../sending-detail/sending-detail';

import { SendingService } from '../../providers/sending-service/sending-service';

@Component({
    selector: 'page-sendings',
    templateUrl: 'sendings.html',
})
export class SendingsPage implements OnInit{

    sendings: any;
    sendingsEmpty = true;

    constructor(public navCtrl: NavController,
        public sendingsService: SendingService) {
    }

    ngOnInit() {
        this.getAllActive();
    }

    goToDetail() {
        this.navCtrl.push(SendingDetailPage);
    }

    createSending() {
        this.navCtrl.setRoot(SendingCreatePage);
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);

        this.getAllActive();

        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
    }

    /**
     *  PRIVATE
     */

    private getAllActive() {
        let listRef = this.sendingsService.getAllMyActiveRef();
        listRef
            .subscribe(snapshots => {
                console.log('sendings > getAllActive > subscribe > init');                
                this.sendings = [];
                snapshots.forEach(snapshot => {
                    //let key = snapshot.key;
                    let item = snapshot.val();
                    this.sendings.push(item); 
                });
                if(this.sendings.length > 0) {
                    this.sendingsEmpty = false;
                }else{
                    this.sendingsEmpty = true;
                }
            });
    }

}
