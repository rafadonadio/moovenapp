import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';
import { DateService } from '../../providers/date-service/date-service';

import { SendingsPage} from '../sendings/sendings';
import { SendingCreate2Page} from '../sending-create-2/sending-create-2';
import { SendingCreate4Page} from '../sending-create-4/sending-create-4';
import { ModalSearchMapAddressPage } from '../modal-search-map-address/modal-search-map-address';

const MIN_TIMEDIFF_MINUTES = 120;

@Component({
    selector: 'page-sending-create-3',
    templateUrl: 'sending-create-3.html'
})
export class SendingCreate3Page implements OnInit{

    // sending model
    sending: any;

    // user
    user: any;
    profile: any;

    // form
    formThree: FormGroup;
    dropAddressFullText: any;
    dropAddressLine2: any;    
    dropTimeFrom: any;
    dropTimeTo: any;
    dropPersonName: any;
    dropPersonPhone: any;
    dropPersonEmail: any;
    // form aux
    rangeFrom: any;
    rangeTo: any;
    showErrors:boolean = false;

    // map
    map: any;
    mapMarkers = [];
    placeDetails: any; 

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public gmapsService: GoogleMapsService,
        public dateSrv: DateService) {
    }

    ngOnInit() {
        console.log('f3 > init');
        console.group('f3');        
        this.setUser();
        this.initPlaceDetails();
        this.initMap();        
        // init form
        this.formThree = this.formBuilder.group({
            'dropAddressFullText': ['', Validators.compose([Validators.required])],
            'dropAddressLine2': ['', Validators.compose([Validators.maxLength(100)])],
            'dropTimeFrom': ['', Validators.compose([Validators.required])],
            'dropTimeTo': ['', Validators.compose([Validators.required])],
            'dropPersonName': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
            'dropPersonPhone': ['', Validators.compose([Validators.required])],
            'dropPersonEmail': ['', Validators.compose([EmailValidator.isValid])],
        });
        this.dropAddressFullText = this.formThree.controls['dropAddressFullText'];
        this.dropAddressLine2 = this.formThree.controls['dropAddressLine2'];        
        this.dropTimeFrom = this.formThree.controls['dropTimeFrom'];
        this.dropTimeTo = this.formThree.controls['dropTimeTo'];
        this.dropPersonName = this.formThree.controls['dropPersonName'];
        this.dropPersonPhone = this.formThree.controls['dropPersonPhone'];
        this.dropPersonEmail = this.formThree.controls['dropPersonEmail'];
        // set sending from param
        this.getSendingFromParams();
        // populate page
        this.populatePage();        
    }

    /**
     * MAIN ACTIONS
     */

    goBack() {
        console.log('f3 > go back to f2');
        this.update();
        this.goBacktoStep2();
    }

    submit() {
        console.log('f3 > submit');
        if(!this.formThree.valid) {
            console.log('f3 > submit > invalid');
            this.showErrors = true;
        }else{
            console.log('f3 > submit > valid');
            this.showErrors = false;
            this.update();
            this.goToNextStep();
        }    
    }

    cancel() {
        console.info('f3 > cancelSending');        
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Envío?',
            message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f3 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('f3 > cancel form > yes, cancel');
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

    showAddressSearchModal() {
        // reset 
        this.resetAddressElements();
        // init
        let param = {
            'modalTitle': 'Dirección de Entrega'
        };    
        let modal = this.modalCtrl.create(ModalSearchMapAddressPage, param);
        modal.onDidDismiss(data => {
            console.log('f2 > modal dismissed > data param > ', data);
            this.processAddressSearchResult(data);
        });
        modal.present();
        console.log('f2 > modal present');
    }

    adjustDropTimeFrom(e) {
        console.group('adjustPickupTimeFrom');
        console.log('from/to > ', this.dropTimeFrom.value, this.dropTimeTo.value);  
        let from = this.dateSrv.setTimeMoment(this.dropTimeFrom.value);
        let to = this.dateSrv.setTimeMoment(this.dropTimeTo.value);    
        let diff = this.dateSrv.getTimeDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let subtract = MIN_TIMEDIFF_MINUTES;
            let newFrom = this.dateSrv.setTimeMoment(this.dropTimeTo.value);
            newFrom.subtract(subtract, "minutes");            
            let newFromString = newFrom.format('HH:mm');            
            console.log('newFrom/to: ', newFromString, to.format('HH:mm'));      
            this.dropTimeFrom.setValue(newFrom.format('HH:mm'));
            // show message
            this.showTimeRangeToast('Desde', newFromString);               
        }else{
            console.log('diff ok');
        }
        console.groupEnd();        
    }

    adjustDropTimeTo(e) {
        console.group('adjustPickupTimeTo');
        console.log('from/to > ', this.dropTimeFrom.value, this.dropTimeTo.value);  
        let from = this.dateSrv.setTimeMoment(this.dropTimeFrom.value);
        let to = this.dateSrv.setTimeMoment(this.dropTimeTo.value);    
        let diff = this.dateSrv.getTimeDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let add = MIN_TIMEDIFF_MINUTES;
            let newTo = this.dateSrv.setTimeMoment(this.dropTimeFrom.value);
            newTo.add(add, "minutes");            
            let newToString = newTo.format('HH:mm');
            console.log('from/newTo: ', from.format('HH:mm'), newToString);
            this.dropTimeTo.setValue(newToString);
            // show message
            this.showTimeRangeToast('Hasta', newToString);
        }else{
            console.log('diff ok');
        }
        console.groupEnd();
    }

    populateContactWithUserData() {
        console.log('f3 > populate dropContact with current user');
        this.dropPersonName.setValue(this.user.displayName);
        this.dropPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.dropPersonEmail.setValue(this.user.email);
    }

    resetAddress() {
        this.resetAddressElements();
    }

    private resetAddressElements() {
        console.info('f3 > resetAddressElements');
        this.initMap();
        this.populateAddressInput('');
        this.dropAddressLine2.setValue('');
        this.initPlaceDetails();

        // reset all sending address related
        this.sending.dropAddressSet = false;
        this.sending.dropAddressIsComplete = false;
        this.sending.dropAddressUserForcedValidation = false;
        this.sending.dropAddressPlaceId = '';
        this.sending.dropAddressLat = '';
        this.sending.dropAddressLng = '';            
        this.sending.dropAddressFullText = '';
        this.sending.dropAddressStreetShort = '';
        this.sending.dropAddressStreetLong = '';
        this.sending.dropAddressNumber = '';
        this.sending.dropAddressPostalCode = '';            
        this.sending.dropAddressCityAreaShort = '';
        this.sending.dropAddressCityAreaLong = '';
        this.sending.dropAddressCityShort = '';
        this.sending.dropAddressCityLong = '';
        this.sending.dropAddressStateAreaShort = '';
        this.sending.dropAddressStateAreaLong = '';        
        this.sending.dropAddressStateShort = '';
        this.sending.dropAddressStateLong = '';
        this.sending.dropAddressCountry = '';         
    }  

    private showTimeRangeToast(input:string, newTime:string) {
        let toast = this.toastCtrl.create({
            message: 'Indica al menos 2 hs de margen horario, se ajustó "' + input + '" a "' + newTime + '"',
            duration: 6000,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'OK'
        });
        toast.present();    
    }

    /**
     *  NAVIGATION
     */

    private goToNextStep() {
        console.log('f3 > go to f4, include this.sending in params');
        console.groupEnd();        
        this.navCtrl.setRoot(SendingCreate4Page, {
            sending: this.sending
        });
    }

    private goBacktoStep2() {
        console.log('f3 > go to f2, include this.sending in params');
        console.groupEnd();        
        this.navCtrl.setRoot(SendingCreate2Page, {
            sending: this.sending
        });
    }

    /**
     *  SUBMIT HELPERS
     */

    private updateAddressDetails():void {
        console.info('f3 > updateSendingAddressPlaceDetails > save address values in this.sending');           
        this.sending.dropAddressFullText = this.placeDetails.full_address;
        this.sending.dropAddressSet = this.placeDetails.set;
        this.sending.dropAddressIsComplete = this.placeDetails.complete;
        this.sending.dropAddressUserForcedValidation = this.placeDetails.forced;
        this.sending.dropAddressPlaceId = this.placeDetails.place_id;
        this.sending.dropAddressLat = this.placeDetails.lat;
        this.sending.dropAddressLng = this.placeDetails.lng;            
        this.sending.dropAddressStreetShort = this.placeDetails.components.route.short;
        this.sending.dropAddressStreetLong = this.placeDetails.components.route.long;
        this.sending.dropAddressNumber = this.placeDetails.components.street_number.long;
        this.sending.dropAddressPostalCode = this.placeDetails.components.postal_code.long + this.placeDetails.components.postal_code_suffix.long;            
        this.sending.dropAddressCityAreaShort = this.placeDetails.components.sublocality_level_1.short;
        this.sending.dropAddressCityAreaLong = this.placeDetails.components.sublocality_level_1.long;
        this.sending.dropAddressCityShort = this.placeDetails.components.locality.short;
        this.sending.dropAddressCityLong = this.placeDetails.components.locality.long;
        this.sending.dropAddressStateAreaShort = this.placeDetails.components.administrative_area_level_2.short;
        this.sending.dropAddressStateAreaLong = this.placeDetails.components.administrative_area_level_2.long;        
        this.sending.dropAddressStateShort = this.placeDetails.components.administrative_area_level_1.short;
        this.sending.dropAddressStateLong = this.placeDetails.components.administrative_area_level_1.long;
        this.sending.dropAddressCountry = this.placeDetails.components.country.long;           
        console.log('f3 > this.sending > ', this.sending);
    }

    private update() {
        console.log('f3 > save form values in this.sending');
        this.sending.dropAddressLine2 = this.dropAddressLine2.value;
        this.sending.dropTimeFrom = this.dropTimeFrom.value;
        this.sending.dropTimeTo = this.dropTimeTo.value;
        this.sending.dropPersonName = this.dropPersonName.value;
        this.sending.dropPersonPhone = this.dropPersonPhone.value;
        this.sending.dropPersonEmail = this.dropPersonEmail.value;
        console.log('f3 > this.sending > ', this.sending);
    }

    /**
     *  GOOGLE MAPS HELPERS
     */

    private processAddressSearchResult(item:any) {
        console.info('f3 > processAddressSearchResult');
        if(item){            
            // get place details with place_id
            this.setPlaceDetails(item.place_id);
        }else{
            // item is undefined, cant process
            console.error('f2 > processAddressSearchResult > item selected in modal is undefined > ', item);
        }    
    }

    private setPlaceDetails(place_id:string) {
        console.info('f3 > setPlaceDetails > init');
        this.gmapsService.getPlaceDetails(place_id, this.map)
            .then((place) => {
                console.log('f3 > setPlaceDetails > success ');
                let details = this.gmapsService.inspectPlaceDetails(place);
                console.log('details extracted > ', details);
                if(this.gmapsService.isPlaceAddressComplete(details)) {
                    let latlng = this.gmapsService.setlatLng(details.lat, details.lng);
                    this.setMapCenter(latlng);
                    this.addMapMarker(latlng); 
                    // populate
                    this.placeDetails = details;
                    this.placeDetails.set = true;
                    this.placeDetails.complete = true;
                    this.populateAddressInput(details.full_address);
                    // save
                    this.updateAddressDetails();                           
                }else{
                     console.error('f3 > setPlaceDetails > address incomplete ', details);
                    // alert user
                    let alert = this.alertCtrl.create({
                        title: 'Dirección incompleta',
                        subTitle: 'Debe indicarse una dirección de retiro exacta, que incluya nombre de calle, númeración y ciudad. Vuelve a intentarlo.',
                        buttons: ['Cerrar']
                    });
                    alert.present();                    
                    this.placeDetails.set = false;
                    this.placeDetails.complete = false;                    
                }    
            })
            .catch((error) => {
                console.error('f3 > setPlaceDetails > error > ', error);
            });
    }

    private setMapCenter(latlng: any):void {
        console.info('f3 > setMapCenter');
        this.map.setCenter(latlng);
        this.map.setZoom(15);       
    }

    private addMapMarker(latlng:any):void {
        console.info('f3 > addMapMarker');
        let marker = this.gmapsService.addMapMarker(latlng, this.map);
        this.mapMarkers.push(marker);
    } 

    private initMap() {
        console.info('f3 > initMap');
        let latlng = this.gmapsService.setlatLng(-34.603684, -58.381559);
        let divMap = (<HTMLInputElement>document.getElementById('mapf3'));
        this.map = this.gmapsService.initMap(latlng, divMap);
    }    

    /**
     *  INIT HELPERS
     */

    private setUser(){
        this.user = this.users.getUser();
        // set profile
        this.users.getAccountProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
        });
    }

    private initPlaceDetails() {
        console.info('f3 > initPlaceDetails');
        this.placeDetails = this.gmapsService.initPlaceDetails();
    }

    private getSendingFromParams() {
        console.log('f3 > get navParams > this.sending');
        console.log('f3 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

    private populatePage() {
        console.log('f3 > populate form with this.sending');
        // map
        if(this.sending.dropAddressSet==true) {
            console.info('f3 > populatePage > set map');
            var latlng = {
                lat: this.sending.dropAddressLat,
                lng: this.sending.dropAddressLng,
            }
            console.log('f3 > populatePage > latlng > ', latlng);
            this.setMapCenter(latlng);
            this.addMapMarker(latlng);
        }
        // address
        this.dropAddressFullText.setValue(this.sending.dropAddressFullText);
        this.dropAddressLine2.setValue(this.sending.dropAddressLine2);          
        //datetime
        this.dropTimeFrom.setValue(this.sending.dropTimeFrom);
        this.dropTimeTo.setValue(this.sending.dropTimeTo);
        this.rangeFrom = this.sending.dropTimeFrom;
        this.rangeTo = this.sending.dropTimeTo;
        // contact
        this.dropPersonName.setValue(this.sending.dropPersonName);
        this.dropPersonPhone.setValue(this.sending.dropPersonPhone);
        this.dropPersonEmail.setValue(this.sending.dropPersonEmail);
    }

    private populateAddressInput(fullAddress:string) {
        console.log('f2 > populateAddressInput > ', fullAddress);
        this.dropAddressFullText.setValue(fullAddress);
    }



}
