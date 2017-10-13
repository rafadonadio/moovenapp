import { Observable } from 'rxjs/Rx';
import { FaqProvider } from '../../providers/faq/faq';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'page-help',
    templateUrl: 'help.html',
})
export class HelpPage {

    faqs: Observable<any[]>;
    toggler:any = {};

    constructor(public navCtrl: NavController,
        private faqSrv: FaqProvider) {
    }

    ionViewWillEnter() {
        this.getAll();  
    }

    toggleDetail(id:string) {
        this.toggler[id] = this.toggler[id]==true ? false : true;
    }

    private getAll() {
        this.faqs = this.faqSrv.getAll().snapshotChanges()
            .map(actions => {
                console.log('getAll ...', actions.length);
                return actions.map(a => {
                    const data = a.payload.doc.data() as any;
                    const id = a.payload.doc.id;
                    this.toggler[id] = false;
                    return { id, ...data }; // return object, ... spread operator
                });
            });
    }
}
