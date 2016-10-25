import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

declare var google:any;

@Component({
    selector: 'page-modal-search-map-address',
    templateUrl: 'modal-search-map-address.html'
})
export class ModalSearchMapAddressPage implements OnInit{

    modalTitle:string = '';
    autocompleteItems: any;
    autocomplete: any;
    acService:any;
    placesService: any;

    constructor(public navCtrl: NavController,
        public params:NavParams,
        public viewCtrl:ViewController,
        public alertCtrl: AlertController) { 
    }

    ngOnInit() {
        this.modalTitle = this.params.get('modalTitle');
        this.acService = new google.maps.places.AutocompleteService();
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
        console.log('modal > chooseItem > item > ', item);
        // check item has a place_id
        let place_id = item.place_id ? item.place_id : false;
        if(place_id) {
            console.log('modal > chooseItem > place_id ok > ', place_id);
            this.viewCtrl.dismiss(item);
        }else{
            console.log('modal > chooseItem > place_id false > ', item.place_id);
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Ocurrió un error con el item seleccionado, por favor vuelve a intentarlo.',
                buttons: ['Cerrar']
            });
            alert.present();            
        }

    }

    updateSearch() {
        console.log('modal > updateSearch');        
        if (this.autocomplete.query == '') {
            this.autocompleteItems = [];
            return;
        }
        let self = this;
        let config = { 
            types:  ['geocode'],
            input: this.autocomplete.query, 
            componentRestrictions: { country: 'AR' } 
        }
        this.acService.getPlacePredictions(config, function (predictions, status) {
            console.log('modal > getPlacePredictions > status > ', status);
            self.autocompleteItems = [];            
            predictions.forEach(function (prediction) {              
                self.autocompleteItems.push(prediction);
            });
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

    /**
     *  PRIVATE
     */

}
