import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingDetailPage } from '../sending-detail/sending-detail';

import { SendingService } from  '../../providers/sending-service/sending-service';

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
        // init array
        var self = this;
        var ref = this.sendingsService.getAllActiveRef();
        ref.on('value', function(snapshot) {
            var result = snapshot.val();
            console.log(result);
            self.sendings = [];
            for (var key in result) {
                var item = result[key];
                self.sendings.push(item);
                console.log('array > ', self.sendings);
            }
            if(self.sendings.length > 0) {
                self.sendingsEmpty = false;
                console.log(self.sendingsEmpty);
            }
        })
    }

}
