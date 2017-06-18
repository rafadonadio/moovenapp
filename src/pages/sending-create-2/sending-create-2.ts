import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';
import { DateService, DATES_NAMES, DATE_DEFAULTS } from '../../providers/date-service/date-service';

import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';
import { ModalSearchMapAddressPage } from '../modal-search-map-address/modal-search-map-address';

const MIN_TIMEDIFF_MINUTES = DATE_DEFAULTS.PICKUP_DROP_MIN_DIFF_IN_MINUTES;
const DATES_TXT = DATES_NAMES;
const PICKUP_DIFF_DAYS = DATE_DEFAULTS.PICKUP_DIFF_DAYS;

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
    pickupDate:any;
    pickupTimeFrom: any;
    pickupTimeTo: any;
    pickupPersonName: any;
    pickupPersonPhone: any;
    pickupPersonEmail: any;
    // form aux
    rangeDate: any;
    rangeFrom: any;
    rangeTo: any;
    showErrors: boolean = false;
    monthNames: any = DATES_TXT.monthNames.es;
    monthShortNames: any = DATES_TXT.monthShortNames.es;
    dayNames: any = DATES_TXT.dayNames.es;
    dayShortNames: any = DATES_TXT.dayShortNames.es;
    dateLimits:any;
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
        console.info('f2 > init');
        // init
        this.setUser();
        this.initPlaceDetails();        
        this.initMap();
        // init form
        this.setDateLimits();
        this.initForm();
        // set request from param
        this.getSendingFromParams();
        // populate page
        this.populatePage();
    }

    /**
     * MAIN ACTIONS
     */

    private setDateLimits() {
        let today = this.dateSrv.getIsoString();
        this.dateLimits = {
            min: today,
            max: this.dateSrv.addDays(today, PICKUP_DIFF_DAYS),
        }
        console.log('limits', this.dateLimits);
    }

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

    showAddressSearchModal() {
        // reset 
        this.resetAddressElements();
        // init
        let param = {
            'modalTitle': 'Dirección de Retiro'
        };    
        let modal = this.modalCtrl.create(ModalSearchMapAddressPage, param);
        modal.onDidDismiss(data => {
            console.log('f2 > modal dismissed > data param > ', data);
            this.processAddressSearchResult(data);
        });
        modal.present();
        console.log('f2 > modal present');
    }

    setDate(e) {
        console.log('setDate', this.rangeDate, this.pickupDate.value);
        console.log('setDate e', e);
    }

    adjustPickupTimeFrom(e) {
        console.log('adjustPickupTimeFrom');
        console.log('from/to > ', this.pickupTimeFrom.value, this.pickupTimeTo.value);  
        let from = this.dateSrv.setTimeMoment(this.pickupTimeFrom.value);
        let to = this.dateSrv.setTimeMoment(this.pickupTimeTo.value);    
        let diff = this.dateSrv.getTimeDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let subtract = MIN_TIMEDIFF_MINUTES;
            let newFrom = this.dateSrv.setTimeMoment(this.pickupTimeTo.value);
            newFrom.subtract(subtract, "minutes");
            let newFromString = newFrom.format('HH:mm');
            console.log('newFrom/to: ', newFromString, to.format('HH:mm'));            
            this.pickupTimeFrom.setValue(newFromString);
            // show message
            this.showTimeRangeToast('Desde', newFromString);            
        }else{
            console.log('diff ok');
        }
                
    }

    adjustPickupTimeTo(e) {
        console.group('adjustPickupTimeTo');
        console.log('from/to > ', this.pickupTimeFrom.value, this.pickupTimeTo.value);  
        let from = this.dateSrv.setTimeMoment(this.pickupTimeFrom.value);
        let to = this.dateSrv.setTimeMoment(this.pickupTimeTo.value);    
        let diff = this.dateSrv.getTimeDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let add = MIN_TIMEDIFF_MINUTES;
            let newTo = this.dateSrv.setTimeMoment(this.pickupTimeFrom.value);
            newTo.add(add, "minutes");
            let newToString = newTo.format('HH:mm');
            console.log('from/newTo: ', from.format('HH:mm'), newToString);
            this.pickupTimeTo.setValue(newToString);
            // show message
            this.showTimeRangeToast('Hasta', newToString);
        }else{
            console.log('diff ok');
        }
        
    }

    populateContactWithUserData() {
        console.log('f2 > populate pickupContact with current user');
        this.pickupPersonName.setValue(this.user.displayName);
        this.pickupPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.pickupPersonEmail.setValue(this.user.email);
    }

    resetAddress() {
        this.resetAddressElements();
    }

    private resetAddressElements() {
        console.info('f2 > resetPickupAddressElements');
        this.initMap();
        this.populateAddressInput('');
        this.pickupAddressLine2.setValue('');
        this.initPlaceDetails();

        // reset all sending address related
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
        console.info('f2 > go to f3, include params');
        
        this.navCtrl.setRoot(SendingCreate3Page, {
            sending: this.sending
        });
    }

    private goBacktoStep1() {
        console.info('f2 > go to f1, include params');
        
        this.navCtrl.setRoot(SendingCreatePage, {
            sending: this.sending
        });
    }

    /**
     *  SUBMIT HELPERS
     */

    private updateAddressDetails():void {
        console.info('f2 > updateSendingAddressPlaceDetails > save address values in this.sending');           
        this.sending.pickupAddressFullText = this.placeDetails.full_address;
        this.sending.pickupAddressSet = this.placeDetails.set;
        this.sending.pickupAddressIsComplete = this.placeDetails.complete;
        this.sending.pickupAddressUserForcedValidation = this.placeDetails.forced;
        this.sending.pickupAddressPlaceId = this.placeDetails.place_id;
        this.sending.pickupAddressLat = this.placeDetails.lat;
        this.sending.pickupAddressLng = this.placeDetails.lng;            
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

    private update():void {
        console.info('f2 > updateSending > save form values in this.sending');   
        // address - aux
        this.sending.pickupAddressLine2 = this.pickupAddressLine2.value;
        // time
        this.sending.pickupDate = this.pickupDate.value;
        this.sending.pickupTimeFrom = this.pickupTimeFrom.value;
        this.sending.pickupTimeTo = this.pickupTimeTo.value;
        // contact
        this.sending.pickupPersonName = this.pickupPersonName.value;
        this.sending.pickupPersonPhone = this.pickupPersonPhone.value;
        this.sending.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('f2 > this.sending > ', this.sending);
    }

    /**
     *  GOOGLE MAPS HELPERS
     */

    private processAddressSearchResult(item:any) {
        console.info('f2 > processAddressSearchResult');
        if(item){            
            // get place details with place_id
            this.setPlaceDetails(item.place_id);
        }else{
            // item is undefined, cant process
            console.error('f2 > processAddressSearchResult > item selected in modal is undefined > ', item);
        }    
    }

    private setPlaceDetails(place_id:string) {
        console.info('f2 > setPlaceDetails > init');
        this.gmapsService.getPlaceDetails(place_id, this.map)
            .then((place) => {
                console.log('f2 > setPlaceDetails > success ');
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
                     console.error('f2 > setPlaceDetails > address incomplete ', details);
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
                console.error('f2 > setPlaceDetails > error > ', error);
            });
    }

    private setMapCenter(latlng: any):void {
        console.info('f2 > setMapCenter');
        this.map.setCenter(latlng);
        this.map.setZoom(15);       
    }

    private addMapMarker(latlng:any):void {
        console.info('f2 > addMapMarker');
        let marker = this.gmapsService.addMapMarker(latlng, this.map);
        this.mapMarkers.push(marker);
    }     

    private initMap() {
        console.info('f2 > initMap');
        let latlng = this.gmapsService.setlatLng(-34.603684, -58.381559);
        let divMap = (<HTMLInputElement>document.getElementById('mapf2'));
        this.map = this.gmapsService.initMap(latlng, divMap);
    }

    /**
     *  INIT HELPERS
     */

     private initForm() {
        this.formTwo = this.formBuilder.group({
            'pickupAddressFullText': ['', Validators.compose([Validators.required])],
            'pickupAddressLine2': ['', Validators.compose([Validators.maxLength(100)])],
            'pickupDate': ['', Validators.compose([Validators.required])],
            'pickupTimeFrom': ['', Validators.compose([Validators.required])],
            'pickupTimeTo': ['', Validators.compose([Validators.required])],
            'pickupPersonName': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
            'pickupPersonPhone': ['', Validators.compose([Validators.required])],
            'pickupPersonEmail': ['', Validators.compose([EmailValidator.isValid])],
        });
        this.pickupAddressFullText = this.formTwo.controls['pickupAddressFullText'];
        this.pickupAddressLine2 = this.formTwo.controls['pickupAddressLine2'];
        this.pickupDate = this.formTwo.controls['pickupDate'];
        this.pickupTimeFrom = this.formTwo.controls['pickupTimeFrom'];
        this.pickupTimeTo = this.formTwo.controls['pickupTimeTo'];
        this.pickupPersonName = this.formTwo.controls['pickupPersonName'];
        this.pickupPersonPhone = this.formTwo.controls['pickupPersonPhone'];
        this.pickupPersonEmail = this.formTwo.controls['pickupPersonEmail'];         
     }

    private setUser() {
        this.user = this.users.getUser();
        // set profile
        this.users.getAccountProfileData()
            .then((snapshot) => {
                this.profile = snapshot.val();
            });
    }    

    private initPlaceDetails() {
        console.info('f2 > initPlaceDetails');
        this.placeDetails = this.gmapsService.initPlaceDetails();
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
        this.pickupDate.setValue(this.sending.pickupDate);
        this.pickupTimeFrom.setValue(this.sending.pickupTimeFrom);
        this.pickupTimeTo.setValue(this.sending.pickupTimeTo);
        this.rangeFrom = this.sending.pickupTimeFrom;
        this.rangeTo = this.sending.pickupTimeTo;
        // contact
        this.pickupPersonName.setValue(this.sending.pickupPersonName);
        this.pickupPersonPhone.setValue(this.sending.pickupPersonPhone);
        this.pickupPersonEmail.setValue(this.sending.pickupPersonEmail);
    }

    private populateAddressInput(fullAddress:string) {
        console.log('f2 > populateAddressInput > ', fullAddress);
        this.pickupAddressFullText.setValue(fullAddress);
    }

}
