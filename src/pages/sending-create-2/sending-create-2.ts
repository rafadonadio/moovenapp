import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';
import { GoogleMapsPlacesService } from '../../providers/google-maps-places-service/google-maps-places-service';

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

    // sending model
    sending: any;

    // user
    user: any;
    profile: any;

    // form
    formTwo: FormGroup;
    pickupAddressFullText: any;
    pickupAddressLine2: any;
    pickupTimeFrom: any;
    pickupTimeTo: any;
    pickupPersonName: any;
    pickupPersonPhone: any;
    pickupPersonEmail: any;
    // form aux
    rangeFrom: any;
    rangeTo: any;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    showErrors: boolean = false;

    // map
    map: any;
    mapMarkers = [];
    placeDetails: any;    

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public placesService: GoogleMapsPlacesService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController) {
    }

    ngOnInit() {
        console.info('f2 > init');
        console.group('f2');
        // init
        this.setUser();
        this.initPlaceDetails();        
        this.initMap();
        // init form
        this.formTwo = this.formBuilder.group({
            'pickupAddressFullText': ['', Validators.compose([Validators.required])],
            'pickupAddressLine2': ['', Validators.compose([Validators.maxLength(100)])],
            'pickupTimeFrom': ['', Validators.compose([Validators.required])],
            'pickupTimeTo': ['', Validators.compose([Validators.required])],
            'pickupPersonName': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
            'pickupPersonPhone': ['', Validators.compose([Validators.required])],
            'pickupPersonEmail': ['', Validators.compose([EmailValidator.isValid])],
        });
        this.pickupAddressFullText = this.formTwo.controls['pickupAddressFullText'];
        this.pickupAddressLine2 = this.formTwo.controls['pickupAddressLine2'];
        this.pickupTimeFrom = this.formTwo.controls['pickupTimeFrom'];
        this.pickupTimeTo = this.formTwo.controls['pickupTimeTo'];
        this.pickupPersonName = this.formTwo.controls['pickupPersonName'];
        this.pickupPersonPhone = this.formTwo.controls['pickupPersonPhone'];
        this.pickupPersonEmail = this.formTwo.controls['pickupPersonEmail'];
        // set request from param
        this.getSendingFromParams();
        // populate page
        this.populatePage();
    }

    /**
     * MAIN ACTIONS
     */

    goBack() {
        console.info('f2 > go back to f1');
        this.update();
        this.goBacktoStep1();
    }

    submit() {
        console.info('f2 > submit');
        if(!this.formTwo.valid){
            console.error('f2 > submit > invalid');
            this.showErrors = true;
        }else{
            console.log('f2 > submit > valid');
            this.update();
            this.goToNextStep();
        }
    }

    cancel() {
        console.info('f2 > cancelSending');
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
     *  FORM HELPERS
     */

    showPickupAddressSearchModal() {
        // reset 
        this.resetPickupAddressElements();
        // init
        let param = {
            'modalTitle': 'Dirección de retiro'
        };    
        let modal = this.modalCtrl.create(ModalSearchMapAddressPage, param);
        modal.onDidDismiss(data => {
            console.log('f2 > modal dismissed > data param > ', data);
            this.processAddressSearchResult(data);
        });
        modal.present();
        console.log('f2 > modal present');
    }

    adjustPickupTimeFrom(e) {
        console.log('f2 > new hour to > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeFrom.value);
    }

    adjustPickupTimeTo(e) {
        console.log('f2 > new hour from > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeTo.value);
    }

    populateContactWithUserData() {
        console.log('f2 > populate pickupContact with current user');
        this.pickupPersonName.setValue(this.user.displayName);
        this.pickupPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.pickupPersonEmail.setValue(this.user.email);
    }

    resetPickupAddress() {
        this.resetPickupAddressElements();
    }

    private resetPickupAddressElements() {
        console.info('f2 > resetPickupAddressElements');
        this.initMap();
        this.populatePickupAddressInput('');
        this.pickupAddressLine2.setValue('');
        this.initPlaceDetails();

        // init all sending address related
        this.sending.pickupAddressSet = false;
        this.sending.pickupAddressIsComplete = false;
        this.sending.pickupAddressUserForcedValidation = false;
        this.sending.pickupAddressPlaceId = '';
        this.sending.pickupAddressLat = '';
        this.sending.pickupAddressLng = '';            
        this.sending.pickupAddressFullText = '';
        this.sending.pickupAddressStreetShort = '';
        this.sending.pickupAddressStreetLong = '';
        this.sending.pickupAddressNumber = '';
        this.sending.pickupAddressPostalCode = '';            
        this.sending.pickupAddressCityAreaShort = '';
        this.sending.pickupAddressCityAreaLong = '';
        this.sending.pickupAddressCityShort = '';
        this.sending.pickupAddressCityLong = '';
        this.sending.pickupAddressStateAreaShort = '';
        this.sending.pickupAddressStateAreaLong = '';        
        this.sending.pickupAddressStateShort = '';
        this.sending.pickupAddressStateLong = '';
        this.sending.pickupAddressCountry = '';         
    }    

    /**
     *  NAVIGATION
     */

    private goToNextStep() {
        console.info('f2 > go to f3, include params');
        console.groupEnd();
        this.navCtrl.push(SendingCreate3Page, {
            sending: this.sending
        });
    }

    private goBacktoStep1() {
        console.info('f2 > go to f1, include params');
        console.groupEnd();
        this.navCtrl.push(SendingCreatePage, {
            sending: this.sending
        });
    }

    /**
     *  SUBMIT HELPERS
     */

    private update():void {
        console.info('f2 > updateSending > save form values in this.sending');   
        // address - aux
        this.sending.pickupAddressLine2 = this.pickupAddressLine2.value;
        // time
        this.sending.pickupTimeFrom = this.pickupTimeFrom.value;
        this.sending.pickupTimeTo = this.pickupTimeTo.value;
        // contact
        this.sending.pickupPersonName = this.pickupPersonName.value;
        this.sending.pickupPersonPhone = this.pickupPersonPhone.value;
        this.sending.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('f2 > this.sending > ', this.sending);
    }

    private updateSendingAddressPlaceDetails():void {
        console.info('f2 > updateSendingAddressPlaceDetails > save address values in this.sending');           
        this.sending.pickupAddressSet = this.placeDetails.set;
        this.sending.pickupAddressIsComplete = this.placeDetails.complete;
        this.sending.pickupAddressUserForcedValidation = this.placeDetails.forced;
        this.sending.pickupAddressPlaceId = this.placeDetails.place_id;
        this.sending.pickupAddressLat = this.placeDetails.lat;
        this.sending.pickupAddressLng = this.placeDetails.lng;            
        this.sending.pickupAddressFullText = this.placeDetails.full_address;
        this.sending.pickupAddressStreetShort = this.placeDetails.components.route.short;
        this.sending.pickupAddressStreetLong = this.placeDetails.components.route.long;
        this.sending.pickupAddressNumber = this.placeDetails.components.street_number.long;
        this.sending.pickupAddressPostalCode = this.placeDetails.components.postal_code.long + this.placeDetails.components.postal_code_suffix.long;            
        this.sending.pickupAddressCityAreaShort = this.placeDetails.components.sublocality_level_1.short;
        this.sending.pickupAddressCityAreaLong = this.placeDetails.components.sublocality_level_1.long;
        this.sending.pickupAddressCityShort = this.placeDetails.components.locality.short;
        this.sending.pickupAddressCityLong = this.placeDetails.components.locality.long;
        this.sending.pickupAddressStateAreaShort = this.placeDetails.components.administrative_area_level_2.short;
        this.sending.pickupAddressStateAreaLong = this.placeDetails.components.administrative_area_level_2.long;        
        this.sending.pickupAddressStateShort = this.placeDetails.components.administrative_area_level_1.short;
        this.sending.pickupAddressStateLong = this.placeDetails.components.administrative_area_level_1.long;
        this.sending.pickupAddressCountry = this.placeDetails.components.country.long;           
        console.log('f2 > this.sending > ', this.sending);
    }

    /**
     *  GOOGLE MAPS HELPERS
     */

    private initMap() {
        console.info('f2 > initMap');
        this.map = null;
        var point = {lat: -34.603684, lng: -58.381559}; // Buenos Aires
        let divMap = (<HTMLInputElement>document.getElementById('map'));
        this.map = new google.maps.Map(divMap, {
            center: point,
            zoom: 10,
            disableDefaultUI: true,
            draggable: false,
            clickableIcons: false,
            zoomControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP            
        });
        console.log('f2 > initMap > map > ', this.map);
    }

    private processAddressSearchResult(item:any) {
        console.info('f2 > processAddressSearchResult');
        if(item){            
            // get place details with place_id
            this.setPlaceDetailAndPopulateOrReset(item.place_id);
        }else{
            // item is undefined, cant process
            console.error('f2 > processAddressSearchResult > item selected in modal is undefined > ', item);
        }    
    }

    private setPlaceDetailAndPopulateOrReset(place_id:string):void {
        console.info('f2 > setPlaceDetailAndPopulateOrReset > place_id > ', place_id);
        // init
        var self = this;
        var request = {
            placeId: place_id
        };
        // init google service
        let service = this.placesService.newService(this.map);
        // run
        service.getDetails(request, callback);
        // callback
        function callback(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log('f2 > getPlaceDetail > callback > place > ', place);
                // extract all iterate address_components result
                let details = self.placesService.extractAddressComponents(place);
                // check enad populate
                if(self.placesService.verifyDetailsMinRequirements(details)) {
                    console.log('f2 > getPlaceDetail > callback > details > verify ok ', details);
                    // update map
                    let latlng = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    }
                    self.setMapCenter(latlng);
                    self.addMapMarker(latlng);
                    // populate
                    self.placeDetails = details;
                    self.placeDetails.set = true;
                    self.placeDetails.complete = true;
                    self.populatePickupAddressInput(details.full_address);
                    // save
                    self.updateSendingAddressPlaceDetails();
                }else{
                    // verify failed
                    console.error('f2 > getPlaceDetail > callback > details > verify failed ', details);
                    // alert user
                    let alert = self.alertCtrl.create({
                        title: 'Dirección incompleta',
                        subTitle: 'Debe indicarse una dirección de retiro exacta, que incluya nombre de calle, númeración y ciudad. Vuelve a intentarlo.',
                        buttons: ['Cerrar']
                    });
                    alert.present();                    
                    self.placeDetails.set = false;
                    self.placeDetails.complete = false;
                }
                console.log('f2 > getPlaceDetail > callback > this.placeDetails ', self.placeDetails);
            }else{
                // service status failed
                console.error('f2 > setPlaceDetail > PlacesServiceStatus not OK > ', status);
            }
        }
    }

    private setMapCenter(latlng: any):void {
        console.info('f2 > setMapCenter');
        console.log('f2 > setMapCenter > map', this.map);
        this.map.setCenter(latlng);
        this.map.setZoom(15);       
    }

    private addMapMarker(latlng:any):void {
        console.info('f2 > addMapMarker');
        var marker = new google.maps.Marker({
          map: this.map,
          position: latlng
        });    
        this.mapMarkers.push(marker);
    }     

    /**
     *  INIT HELPERS
     */

    private setUser() {
        this.user = this.users.getCurrentUser();
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
            });
    }    

    private getSendingFromParams() {
        console.info('f2 > getSendingFromParams');
        console.log('f2 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

    private populatePage() {
        console.info('f2 > populatePage with this.sending');
        // map
        if(this.sending.pickupAddressSet==true) {
            console.info('f2 > populatePage > set map');
            var latlng = {
                lat: this.sending.pickupAddressLat,
                lng: this.sending.pickupAddressLng,
            }
            console.log('f2 > populatePage > latlng > ', latlng);
            this.setMapCenter(latlng);
            this.addMapMarker(latlng);
        }
        // address
        this.pickupAddressFullText.setValue(this.sending.pickupAddressFullText);
        this.pickupAddressLine2.setValue(this.sending.pickupAddressLine2);        
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

    private populatePickupAddressInput(fullAddress:string) {
        console.log('f2 > populatePickupAddressInput > ', fullAddress);
        this.pickupAddressFullText.setValue(fullAddress);
    }

    private initPlaceDetails() {
        console.info('f2 > initPlaceDetails');
        this.placeDetails = {
            set: false
        };
    }

}
