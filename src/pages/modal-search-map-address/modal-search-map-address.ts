import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';


@Component({
    selector: 'page-modal-search-map-address',
    templateUrl: 'modal-search-map-address.html'
})
export class ModalSearchMapAddressPage implements OnInit{

    modalTitle:string = '';
    autocompleteItems: any;
    autocomplete: any;

    constructor(public navCtrl: NavController,
        public params:NavParams,
        public viewCtrl:ViewController,
        public alertCtrl: AlertController,
        public gmapsSrv: GoogleMapsService) { 
    }

    ngOnInit() {
        this.modalTitle = this.params.get('modalTitle');
        this.autocompleteItems = [];
        this.autocomplete = {
            query: ''
        };        
    }

    dismiss() {
        console.log('modal > dismiss');
        this.viewCtrl.dismiss();
    }

    selectItem(item: any) {
        console.info('modal > selectItem');
        console.log('modal > chooseItem > item > ', item);
        // check item has a place_id
        let place_id = item.place_id ? item.place_id : false;
        if(place_id) {
            console.log('modal > chooseItem > place_id ok > ', place_id);
            this.viewCtrl.dismiss(item);
        }else{
            console.error('modal > chooseItem > place_id false > ', item.place_id);
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Ocurrió un error con el item seleccionado, por favor vuelve a intentarlo.',
                buttons: ['Cerrar']
            });
            alert.present();            
        }

    }

    updateSearch() {
        console.info('modal > updateSearch');        
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        let self = this;
        this.gmapsSrv.getPlacePredictions(this.autocomplete.query)
            .then((predictions) => {
                console.log('modal > updateSearch > predictions count > ', predictions.length);
                self.autocompleteItems = [];
                if(predictions && predictions.length > 0) {            
                    predictions.forEach(function (prediction) {              
                        self.autocompleteItems.push(prediction);
                    });
                }
            })
            .catch((error) => {
                console.log('modal > updateSearch > error > ', error);
            });
    }

    showAlertHelp() {
        let alert = this.alertCtrl.create({
            title: 'Ayuda',
            subTitle: 'A medida que escribas la dirección en el campo de búsqueda, se listaran coincidencias mas abajo, cuando encuentres la dirección correspondiente, seleccionala. En general es suficiente con escribir la calle, numeración y localidad. Ejemplo: Av Corrientes 555, Buenos Aires',
            buttons: ['Cerrar']
        });
        alert.present();
    }

}
