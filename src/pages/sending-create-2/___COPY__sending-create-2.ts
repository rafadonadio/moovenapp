import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';
import { DateService, DATES_NAMES, DATE_DEFAULTS } from '../../providers/date-service/date-service';
import { SendingRequest } from '../../models/sending-model';
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
    sending: SendingRequest;

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
    timeLimits:any;
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
        this.initForm();
        // set request from param
        this.getSendingFromParams();
        // populate page
        this.initAndPopulatePage();
        // set selector limits
        this.setDateLimits();
        this.setTimeLimits();
    }

    /**
     *  ACTIONS
     */

    goBack() {
        this.update();
        this.goBacktoStep1();
    }

    resetAddress() {
        this.resetAddressElements();
    }

    submit() {
        this.submitForm();
    }

    cancel() {
        this.cancelSending();
    }

    showAddressSearchModal() {
        this.openAddressModal();
    }

    populateContactWithUserData() {
        this.setPickupPersonData();
    }

    adjustTimeFrom() {
        this.setPickupTimeFrom();
    }

    adjustTimeTo() {
        this.setPickupTimeTo();
    }

    setDate() {
        this.updatePickupDateRelated();
    }

    updateTimeLimits() {
        this.setTimeLimits();
    }



    /// PRIVATE METHODS

    /**
     *  PICKUP DATE
     */
    
    // triggered by setDate()
    private updatePickupDateRelated() {
        console.log('setDate', this.rangeDate);
        this.sending.pickupDate = this.rangeDate;
        // update pickupTimeFrom
        this.setNextValidTimeFrom();
        this.setPickupAndRangeFrom();
        // update pickupTimeTo
        this.sending.pickupTimeTo = this.dateSrv.addHours(this.sending.pickupTimeFrom, 2);
        this.setPickupAndRangeTo();
        // update time limits
        this.setTimeLimits();
    }

    // triggered by initAndPopulate()
    private updatePickupDateWithFromTime() {
        this.sending.pickupDate = this.sending.pickupTimeFrom;
        this.rangeDate = this.sending.pickupTimeFrom;
        console.log('updatePickupDateWithFromTime', this.sending.pickupDate, this.rangeDate);
    }

    /**
     *  PICKUP TIME-FROM
     */

    private setPickupAndRangeFrom() {
        this.pickupTimeFrom.setValue(this.sending.pickupTimeFrom);
        this.rangeFrom = this.sending.pickupTimeFrom;       
        console.log('setPickupAndRangeFrom', this.sending.pickupTimeFrom); 
    }

    private setPickupTimeFrom() {
        console.log('__setPickupTimeFrom__ from,to', this.pickupTimeFrom.value, this.pickupTimeTo.value); 
        let diff = this.dateSrv.getDiff(this.pickupTimeFrom.value, this.pickupTimeTo.value);
        console.log('__setPickupTimeFrom__ diff', diff);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let newFrom = this.dateSrv.subtractMinutes(this.pickupTimeTo.value, MIN_TIMEDIFF_MINUTES);
            this.pickupTimeFrom.setValue(newFrom);
            this.showTimeRangeToast('Desde', this.dateSrv.getTimeFromDate(newFrom));
        }else{
            console.log('__setPickupTimeFrom__ diff OK');
        }   
        this.updatePickupDateWithFromTime();
    }    

    // set pickupTimeFrom date, to next valid hour
    private setNextValidTimeFrom() {
        let from = this.sending.pickupTimeFrom;      
        let hour = this.dateSrv.getHourNum(from);    
        let minute = this.dateSrv.getMinuteNum(from);     
        let newHour;
        let newMinute;
        let newDate;
        if(minute>0 && minute<=30) {
            newHour = hour;
            newMinute = 30;
        }else {
            newHour = hour+1;
            newMinute = 0;            
        }
        if(newHour<=21) {
            newDate = this.dateSrv.setTimeToDate(from, newHour, newMinute); 
        }else{
            newDate = this.dateSrv.addDays(from, 1);
            newDate = this.dateSrv.setTimeToDate(newDate, 9, 0); 
        }        
        this.sending.pickupTimeFrom = newDate;
        console.log('setNextValidTimeFrom', from, hour, minute, newHour, newMinute, newDate);
    }

    /**
     *  PICKUP TIME-TO
     */

    private setPickupAndRangeTo() {
        this.pickupTimeTo.setValue(this.sending.pickupTimeTo);
        this.rangeTo = this.sending.pickupTimeTo;   
        console.log('pickupTimeTo', this.sending.pickupTimeTo); 
    }

    private setPickupTimeTo() {
        console.log('__setPickupTimeTo__ from|to', this.pickupTimeFrom.value, this.pickupTimeTo.value);  
        let diff = this.dateSrv.getDiff(this.pickupTimeFrom.value, this.pickupTimeTo.value);
        console.log('__setPickupTimeTo__ diff', diff);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            let newTo = this.dateSrv.addMinutes(this.pickupTimeFrom.value, MIN_TIMEDIFF_MINUTES);
            this.pickupTimeTo.setValue(newTo);
            this.showTimeRangeToast('Hasta', this.dateSrv.getTimeFromDate(newTo));
        }else{
            console.log('__setPickupTimeTo__ diff OK', diff);
        }        
    }


    /**
     * DATETIME HELPERS
     */

    private getPickupTimeValuesParsed(FromOrTo:string): {hour:number, minute: number} {
        let date = this.sending[`pickupTime${FromOrTo}`];
        let range = {
            hour: this.dateSrv.getHourNum(date),
            minute: this.dateSrv.getMinuteNum(date)
        }
        // console.log('range', range);
        return range;
    }

    // this is fixed, can be today or X days in the future
    private setDateLimits() {
        let now = this.dateSrv.getIsoString();
        this.dateLimits = {
            min: now,
            max: this.dateSrv.addDays(now, PICKUP_DIFF_DAYS),
        }
        console.log('dateLimits', this.dateLimits);
    }

    // depends of pickupDate
    // if today, set limit from current time
    // if in the future, set limit default
    private setTimeLimits() {
        let now = this.dateSrv.getIsoString();
        let fromMin;
        let toMin;
        // pickupDate == today??
        let dateIsToday = this.dateSrv.isDateToday(this.sending.pickupDate);
        console.log('setTimeLimits is pickupDate today?', dateIsToday);
        if(dateIsToday) {
            fromMin = now;
            toMin = this.dateSrv.addHours(now, 2);
        }else{
            fromMin = this.dateSrv.setTimeToDate(this.sending.pickupDate, 0, 0);
            toMin = this.dateSrv.setTimeToDate(this.sending.pickupDate, 2, 0);
        }
        this.timeLimits = {
            from: {
                min: fromMin,
            },
            to: {
                min: toMin,
            }
        }
        console.log('timeLimits', this.timeLimits);
    }


    /**
     * FORM HELPERS
     */

    private submitForm() {
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

    private cancelSending() {
        console.info('f2 > cancelSending');
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Servicio?',
            message: 'Se perderán todos los datos ingresados del Nuevo Servicio.',
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

    private initAndPopulatePage() {
        console.info('__populate__ ');
        // map
        if(this.sending.pickupAddressSet==true) {
            console.info('__pop__ > set map');
            var latlng = {
                lat: this.sending.pickupAddressLat,
                lng: this.sending.pickupAddressLng,
            }
            console.log('__pop__ > latlng > ', latlng);
            this.setMapCenter(latlng);
            this.addMapMarker(latlng);
        }
        // address
        this.pickupAddressFullText.setValue(this.sending.pickupAddressFullText);
        this.pickupAddressLine2.setValue(this.sending.pickupAddressLine2);        
        // contact
        this.pickupPersonName.setValue(this.sending.pickupPersonName);
        this.pickupPersonPhone.setValue(this.sending.pickupPersonPhone);
        this.pickupPersonEmail.setValue(this.sending.pickupPersonEmail);
        //
        // PICKUP DATE, if not set, set today
        if(this.sending.pickupDate=='') {
            this.sending.pickupDate = this.dateSrv.getIsoString();
        }
        this.pickupDate.setValue(this.sending.pickupDate);
        this.rangeDate = this.sending.pickupDate;
        console.log('__PICKUP_DATE__', this.sending.pickupDate, this.rangeDate, this.pickupDate.value);        
        //
        // PICKUP TIME FROM, 
        // if not set, set from pickup date at next valid time
        if(this.sending.pickupTimeFrom=='') {
            this.sending.pickupTimeFrom = this.sending.pickupDate;
            this.setNextValidTimeFrom();
        }else{
            // is set, check is not old, otherwise fix
            let now = this.dateSrv.getIsoString();
            let timeFromIsOld = this.dateSrv.isBeforeThan(this.sending.pickupTimeFrom, now);
            console.log('timeFromIsOld', timeFromIsOld, this.sending.pickupTimeFrom, now);
            if(timeFromIsOld) {
                this.setNextValidTimeFrom();
                // alert that FROM time has changed
                let toast = this.toastCtrl.create({
                    message: `ATENCION: El Horario de Retiro fue ajustado`,
                    duration: 4000,
                    position: 'bottom',
                    showCloseButton: true,
                    closeButtonText: 'OK'
                });
                toast.present();                 
            }
        }
        this.setPickupAndRangeFrom();
        this.updatePickupDateWithFromTime();
        //
        // PICKUP TIME TO, if not set get TimeFrom plus 2 hours 
        if(this.sending.pickupTimeTo=='') {
            let from = this.sending.pickupTimeFrom;
            let to = this.dateSrv.addHours(from, 2);
            this.sending.pickupTimeTo = to;
        }
        this.setPickupAndRangeTo();
        //
        console.log('__pop__ pickupDate', this.sending.pickupDate);        
        console.log('__pop__ pickupTimeFrom', this.sending.pickupTimeFrom);        
        console.log('__pop__ pickupTimeTo', this.sending.pickupTimeTo);        

    }

    private populateAddressInput(fullAddress:string) {
        console.log('f2 > populateAddressInput > ', fullAddress);
        this.pickupAddressFullText.setValue(fullAddress);
    }

    private setPickupPersonData() {
        console.log('f2 > populate pickupContact with current user');
        this.pickupPersonName.setValue(this.user.displayName);
        this.pickupPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.pickupPersonEmail.setValue(this.user.email);        
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
        this.sending.pickupAddressLat = 0;
        this.sending.pickupAddressLng = 0;            
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
     * SUBMIT UPDATES
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

    private openAddressModal() {
        // reset 
        this.resetAddressElements();          
        let modal = this.modalCtrl.create(ModalSearchMapAddressPage, {
                        'modalTitle': 'Dirección de Retiro'
                    });
        modal.onDidDismiss(data => {
            console.log('f2 > modal dismissed > data param > ', data);
            this.processAddressSearchResult(data);  
        });
        modal.present();
        console.log('f2 > modal present');
    }

    private initPlaceDetails() {
        console.info('f2 > initPlaceDetails');
        this.placeDetails = this.gmapsService.initPlaceDetails();
    }

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
     * AUX HELPERS
     */

    private setUser() {
        this.user = this.users.getUser();
        // set profile
        this.users.getAccountProfileData()
            .then((snapshot) => {
                this.profile = snapshot.val();
            });
    }    

    private getSendingFromParams() {
        console.info('f2 > getSendingFromParams');
        console.log('f2 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

    private showTimeRangeToast(input:string, newTime:string) {
        let toast = this.toastCtrl.create({
            message: 'Debe haber al menos 2 hs de margen horario, se ajustó "' + input + '" a "' + newTime + '"',
            duration: 6000,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'OK'
        });
        toast.present();    
    }

}
