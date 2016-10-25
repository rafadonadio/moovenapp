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
        this.viewCtrl.dismiss(item);
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
            subTitle: 'A medida que escribas la dirección en el campo de búsqueda, se listaran coincidencias mas abajo, cuando encuentres la dirección correspondiente, seleccionala. ',
            buttons: ['Cerrar']
        });
        alert.present();
    }

}
