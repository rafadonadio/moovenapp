import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';
import { ModalSearchMapAddressPage } from '../modal-search-map-address/modal-search-map-address';

declare var google:any;

@Component({
    selector: 'page-sending-create-2',
    templateUrl: 'sending-create-2.html'
})
export class SendingCreate2Page implements OnInit {

    sending: any;
    user: any;
    profile: any;

    // form
    formTwo: FormGroup;
    pickupAddressFullText: any;
    pickupTimeFrom: any;
    pickupTimeTo: any;
    pickupPersonName: any;
    pickupPersonPhone: any;
    pickupPersonEmail: any;
   
    // map
    map: any;
    markers = [];
    addressResult: any;
    placedetails: any;    

    // aux
    rangeFrom: any;
    rangeTo: any;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    showErrors: boolean = false;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController) {
    }

    ngOnInit() {
        console.log('f2 > init');
        this.setUser();
        // init form
        this.formTwo = this.formBuilder.group({
            'pickupAddressFullText': ['', Validators.compose([Validators.required])],
            'pickupTimeFrom': ['', Validators.compose([Validators.required])],
            'pickupTimeTo': ['', Validators.compose([Validators.required])],
            'pickupPersonName': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
            'pickupPersonPhone': ['', Validators.compose([Validators.required])],
            'pickupPersonEmail': ['', Validators.compose([EmailValidator.isValid])],
        });
        this.pickupAddressFullText = this.formTwo.controls['pickupAddressFullText'];
        this.pickupTimeFrom = this.formTwo.controls['pickupTimeFrom'];
        this.pickupTimeTo = this.formTwo.controls['pickupTimeTo'];
        this.pickupPersonName = this.formTwo.controls['pickupPersonName'];
        this.pickupPersonPhone = this.formTwo.controls['pickupPersonPhone'];
        this.pickupPersonEmail = this.formTwo.controls['pickupPersonEmail'];
        // set request from param
        this.getSendingFromParams();
        this.initMap();
    }

    /**
     *  METHODS
     */

    showSearchModal() {
        let param = {
            'modalTitle': 'Dirección de retiro'
        };    
        let modal = this.modalCtrl.create(ModalSearchMapAddressPage, param);
        modal.onDidDismiss(data => {
            console.log('f2 > modal dismissed > data param > ', data);
            this.processAddressSearchResult(data);
        });
        modal.present();
    }    

    adjustPickupTimeFrom(e) {
        console.log('f2 > new hour to > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeFrom.value);
    }
    adjustPickupTimeTo(e) {
        console.log('f2 > new hour from > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeTo.value);
    }
    populateUserDataInContact() {
        console.log('f2 > populate pickupContact with current user');
        this.pickupPersonName.setValue(this.user.displayName);
        this.pickupPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.pickupPersonEmail.setValue(this.user.email);
    }

    submit() {
        console.log('f2 > submitted');
        if(!this.formTwo.valid){
            console.log('f2 > submit > invalid');
            this.showErrors = true;
        }else{
            console.log('f2 > submit > valid');
            this.updateSending();
            this.goToNextStep();
        }
    }

    goBack() {
        console.log('f2 > go back to f1');
        this.updateSending();
        this.goBacktoStep1();
    }

    cancelSending() {
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Envío?',
            message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f2 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('f2 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     *  PRIVATE
     */

    private goToNextStep() {
        console.log('f2 > go to f3, include this.sending in params');
        this.navCtrl.push(SendingCreate3Page, {
            sending: this.sending
        });
    }

    private goBacktoStep1() {
        console.log('f2 > go to f1, include this.sending in params');
        this.navCtrl.push(SendingCreatePage, {
            sending: this.sending
        });
    }

    private updateSending() {
        console.log('f2 > save form values in this.sending');
        this.sending.pickupAddressFullText = this.pickupAddressFullText.value;
        this.sending.pickupTimeFrom = this.pickupTimeFrom.value;
        this.sending.pickupTimeTo = this.pickupTimeTo.value;
        this.sending.pickupPersonName = this.pickupPersonName.value;
        this.sending.pickupPersonPhone = this.pickupPersonPhone.value;
        this.sending.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('f2 > this.sending > ', this.sending);
    }

    private getSendingFromParams() {
        console.log('f2 > get navParams > this.sending');
        console.log('f2 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
        this.populateForm();
    }

    private populateForm() {
        console.log('f2 > populate form with this.sending');
        this.pickupAddressFullText.setValue(this.sending.pickupAddressFullText);
        //datetime
        this.pickupTimeFrom.setValue(this.sending.pickupTimeFrom);
        this.pickupTimeTo.setValue(this.sending.pickupTimeTo);
        this.rangeFrom = this.sending.pickupTimeFrom;
        this.rangeTo = this.sending.pickupTimeTo;
        // contact
        this.pickupPersonName.setValue(this.sending.pickupPersonName);
        this.pickupPersonPhone.setValue(this.sending.pickupPersonPhone);
        this.pickupPersonEmail.setValue(this.sending.pickupPersonEmail);
    }

    private setUser() {
        this.user = this.users.getCurrentUser();
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
            });
    }

    /**
     *  GOOGLE MAPS
     */

    private processAddressSearchResult(item:any) {
        console.log('f2 > processAddressSearchResult');
        if(item){            
            this.addressResult = item;
            // populate input
            this.pickupAddressFullText.setValue(item.description);
        }else{
            console.log('f2 > processAddressSearchResult > item undefined > ', item);
        }    
    }

    private getPlaceDetail(place_id:string) {
        var self = this;
        var request = {
            placeId: place_id
        };
        let service = new google.maps.places.PlacesService(this.map);
        service.getDetails(request, callback);
        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log('page > getPlaceDetail > place > ', place);
                // set place in map
                self.map.setCenter(place.geometry.location);
                self.createMapMarker(place);
                
                // populate 
                self.placedetails = {
                    fulladdress: place.formatted_address,
                    streetnumber: place.address_components[0].short_name,
                    streetname: place.address_components[1].long_name,
                    area: place.address_components[2].short_name,
                    locality: place.address_components[3].short_name,
                    latitud: place.geometry.location.lat(),
                    longitud: place.geometry.location.lng(),
                    postalcode: place.address_components[7] ? place.address_components[7].short_name : 'n/d',
                }
                console.log('page > getPlaceDetail > details > ', self.placedetails);
            }else{
                console.log('page > getPlaceDetail > status > ', status);
            }
        }
    }

    private initMap() {
        console.log('f2 > initMap');
        var point = {lat: -34.603684, lng: -58.381559}; // Buenos Aires
        let divMap = (<HTMLInputElement>document.getElementById('map'));
        this.map = new google.maps.Map(divMap, {
            center: point,
            zoom: 15,
            disableDefaultUI: true,
            draggable: false,
            zoomControl: true            
        });
    }

    private createMapMarker(place:any):void {
        console.log('f2 > createMapMarker');
        var placeLocation = place.geometry.location;
        var marker = new google.maps.Marker({
          map: this.map,
          position: placeLocation
        });    
        this.markers.push(marker);
    }     

}
