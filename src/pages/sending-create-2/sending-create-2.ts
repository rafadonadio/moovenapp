import { SendingService } from '../../providers/sending-service/sending-service';
import { DateLimits, TimeLimits } from '../../providers/sending-service/sending-service';
import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';
import { DateService, DATES_NAMES, DATE_DEFAULTS } from '../../providers/date-service/date-service';
import { SendingRequest } from '../../models/sending-model';
import { SendingsTabsPage } from '../sendings-tabs/sendings-tabs';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';
import { ModalSearchMapAddressPage } from '../modal-search-map-address/modal-search-map-address';

const MIN_TIMEDIFF_MINUTES = DATE_DEFAULTS.PICKUP_DROP_MIN_DIFF_IN_MINUTES;
const DATES_TXT = DATES_NAMES;
const PICKUP_DIFF_DAYS = DATE_DEFAULTS.PICKUP_DIFF_DAYS;
const DEFAULT_PICKUP_TIME_FROM_HR = DATE_DEFAULTS.PICKUP_TIME_FROM.hour;
const DEFAULT_PICKUP_TIME_FROM_MIN = DATE_DEFAULTS.PICKUP_TIME_FROM.minute;

@Component({
    selector: 'page-sending-create-2',
    templateUrl: 'sending-create-2.html'
})
export class SendingCreate2Page implements OnInit {

    // sending model
    sending: SendingRequest;
    // user
    account: UserAccount;
    accountSubs: Subscription;
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
    showErrors: boolean = false;
    monthNames: any = DATES_TXT.monthNames.es;
    monthShortNames: any = DATES_TXT.monthShortNames.es;
    dayNames: any = DATES_TXT.dayNames.es;
    dayShortNames: any = DATES_TXT.dayShortNames.es;
    dateLimits: DateLimits;
    timeLimits: TimeLimits;
    addressModal:any;
    // map
    map: any;
    mapMarkers = [];
    placeDetails: any;
    // pickupDateAux
    pickupDatePreventLoopOn:boolean;    

    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private formBuilder: FormBuilder,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController,        
        private gmapsService: GoogleMapsService,
        private dateSrv: DateService,
        private accountSrv: AccountService,
        private sendingSrv: SendingService) {
    }

    ngOnInit() {
        console.groupCollapsed('F2 INIT');
        // init
        this.setAccount();
        this.initPlaceDetails();        
        this.initMap();
        // init form
        this.initForm();
        // set request from param
        this.getSendingFromParams();
        // populate page
        this.setDateLimits();
        this.initAndPopulatePage();
        this.setTimeLimits();
        console.groupEnd();
    }

    ionViewWillLeave() {
        if(this.accountSubs) {
            this.accountSubs.unsubscribe();
        }
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

    updateDateLimits() {
        this.setDateLimits();
    }

    updateTimeLimits() {
        this.setTimeLimits();
    }    

    changePickupDate() {
        this.runPickupDateChange();
    }
 
    changePickupTimeFrom() {
        this.runPickupTimeFromChange();
    }

    changePickupTimeTo() {
        this.runPickupTimeToChange();
    }    

    /// PRIVATE METHODS

    /**
     *  PICKUP DATE
     */

    // triggered by setDate()
    private runPickupDateChange() {
        if(this.pickupDatePreventLoopOn) {
            console.log('PICKUP_DATE_CHANGE: trigger stopped > manual change in process ...');
            return;
        }
        console.groupCollapsed('PICKUP_DATE_CHANGE');
        console.log('selected', this.pickupDate.value);
        // update date limits
        this.setDateLimits();
        // check pickupDate is valid
        if(this.sendingSrv.isPickupDateValid(this.pickupDate.value, this.dateLimits.min, this.dateLimits.max)) {
            console.log('VALID');
            // update PickupDate
            this.setSendingPickupDate(this.pickupDate.value);
            // update pickupTimeFrom
            this.setNextValidTimeFrom();
            // update pickupTimeTo
            let newTo = this.dateSrv.addHours(this.sending.pickupTimeFrom, 2);
            this.setPickupTimeTo(newTo);
            // update TimeLimits
            this.setTimeLimits();
        }else{  
            console.log('INVALID', this.pickupDate.value, this.dateLimits.min, this.dateLimits.max);
            const dateSelected = this.pickupDate.value;
            const dateSelectedHuman = this.dateSrv.displayFormat(dateSelected,'DD/MMM');
            
            // alert
            let alert = this.alertCtrl.create({
                title:'Fecha inválida', 
                subTitle:`Fecha de Retiro "${dateSelectedHuman}" es inválida. 
                          Selecciona una fecha válida, desde hoy y hasta el ${this.dateLimits.maxHuman} inclusive)". La fecha se ha reestablecido a "hoy".`, 
                buttons:['Cerrar']
            });
            alert.present();

            // --- reset date input
            console.log('pickupDatePreventLoop ON');
            this.pickupDatePreventLoopOn = true;
            // this.pickupDate.setValue('');
            // this.setSendingPickupDate('');
            // this.resetDateTimeFromTo();
            this.pickupDate.setValue(this.pickupDate.value);
            this.setSendingPickupDate(this.pickupDate.value);
            setTimeout(() => {
                console.log('pickupDatePreventLoop OFF');
                this.pickupDatePreventLoopOn = false;
            }, 1000);
            // --- end reset
        }
        console.log('value set', this.pickupDate.value);
        console.groupEnd();
    }

    private setPickupDate(isoDate: string) {
        this.setFormPickupDate(isoDate);
        this.setSendingPickupDate(isoDate);
    }
    private setFormPickupDate(isoDate: string) {
        this.pickupDate.setValue(isoDate);
    }
    private setSendingPickupDate(isoDate:string) {
        this.sending.pickupDate = isoDate;
    }

    /**
     *  PICKUP TIME-FROM
     */

    private runPickupTimeFromChange() {
        console.group('runPickupTimeFromChange');
        let newTo;
        let from = this.pickupTimeFrom.value;
        let to = this.pickupTimeTo.value
        let diff = this.dateSrv.getDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            newTo = this.dateSrv.addMinutes(from, MIN_TIMEDIFF_MINUTES);
            this.setPickupTimeTo(newTo);
            this.showTimeRangeToast('Hasta', this.dateSrv.getTimeFromDate(newTo));
        }
        // console.log('diff, from, to, newTo', diff, from, to, newTo);              
        console.groupEnd();
    }

    // set pickupTimeFrom date, to next valid hour
    private setNextValidTimeFrom() {
        console.group('setNextValidTimeFrom');
        // aux
        let newHour;
        let newMinute;
        let newDate;
        let pickupDate = this.sending.pickupDate;      
        let hour = this.dateSrv.getHourNum(pickupDate);    
        let minute = this.dateSrv.getMinuteNum(pickupDate);   
        let dateIsToday = this.dateSrv.isDateToday(pickupDate);
        if(dateIsToday) {
            // pickupDate is today, get nex valid time
            pickupDate = this.dateSrv.getIsoString();
            if(minute<=30) {
                // minutes 0-30, set hour:30
                newHour = hour;
                newMinute = 30;
            }else {
                // minutes 31-59, set hour+1:00
                newHour = hour+1;
                newMinute = 0;            
            }
            if(newHour<=21) {
                // hour 4-21, ok
                newDate = this.dateSrv.setTimeToDate(pickupDate, newHour, newMinute); 
            }else{
                // hour 22-23, set day+1, hour 09:00
                newDate = this.dateSrv.addDays(pickupDate, 1);
                newDate = this.dateSrv.setTimeToDate(newDate, DEFAULT_PICKUP_TIME_FROM_HR, DEFAULT_PICKUP_TIME_FROM_MIN); 
            }
        }else{
            // pickupDate not today, set first valid time of pickupDate
            newDate = this.dateSrv.setTimeToDate(pickupDate, DEFAULT_PICKUP_TIME_FROM_HR, DEFAULT_PICKUP_TIME_FROM_MIN); 
        }
        this.setPickupTimeFrom(newDate);        
        console.log('__NVF__ dateIsToday', dateIsToday);
        console.log('__NVF__ hour:minute', hour, minute);
        console.log('__NVF__ newHour:newMinute', newHour, newMinute);
        console.log('__NVF__ new TimeFrom', newDate);
        console.groupEnd();
    }

    private setPickupTimeFrom(isoDate: string) {
        this.setFormPickupTimeFrom(isoDate);
        this.setSendingPickupTimeFrom(isoDate);
    }
    private setFormPickupTimeFrom(isoDate: string) {
        this.pickupTimeFrom.setValue(isoDate);
    }
    private setSendingPickupTimeFrom(isoDate:string) {
        this.sending.pickupTimeFrom = isoDate;
    }


    /**
     *  PICKUP TIME-TO
     */

    private runPickupTimeToChange() {
        console.group('runPickupTimeToChange');
        let newFrom;
        let from = this.pickupTimeFrom.value;
        let to = this.pickupTimeTo.value
        let diff = this.dateSrv.getDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            newFrom = this.dateSrv.subtractMinutes(to, MIN_TIMEDIFF_MINUTES);
            this.setPickupTimeFrom(newFrom);
            this.showTimeRangeToast('Desde', this.dateSrv.getTimeFromDate(newFrom));
        }
        // console.log('diff, from, to, newFrom', diff, from, to, newFrom);              
        console.groupEnd();
    }

    private setPickupTimeTo(isoDate: string) {
        this.setFormPickupTimeTo(isoDate);
        this.setSendingPickupTimeTo(isoDate);
    }
    private setFormPickupTimeTo(isoDate: string) {
        this.pickupTimeTo.setValue(isoDate);
    }
    private setSendingPickupTimeTo(isoDate:string) {
        this.sending.pickupTimeTo = isoDate;
    }

    /**
     * DATETIME HELPERS
     */

    // set pickupTimeFrom date, to next valid hour
    private resetDateTimeFromTo() {
        console.groupCollapsed('RESET_DATE_TIME_FROM_TO');
        let now = this.dateSrv.getIsoString();
        let hour = this.dateSrv.getHourNum(now);    
        let minute = this.dateSrv.getMinuteNum(now);     
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
        if(newHour>3 && newHour<=21) {
            newDate = this.dateSrv.setTimeToDate(now, newHour, newMinute); 
        }else if(newHour<=3){
            newDate = this.dateSrv.setTimeToDate(now, DEFAULT_PICKUP_TIME_FROM_HR, DEFAULT_PICKUP_TIME_FROM_MIN); 
        }else{
            newDate = this.dateSrv.addDays(now, 1);
            newDate = this.dateSrv.setTimeToDate(newDate, DEFAULT_PICKUP_TIME_FROM_HR, DEFAULT_PICKUP_TIME_FROM_MIN); 
        }        
        this.setPickupDate(newDate);
        this.setPickupTimeFrom(newDate);
        let newTo = this.dateSrv.addHours(newDate, 2);
        this.setPickupTimeTo(newTo);
        console.log('resetDateTimeFromTo', now, hour, minute, newHour, newMinute, newDate, newTo);
        console.groupEnd();
    }

    // this is fixed, can be today or X days in the future
    private setDateLimits() {
        console.groupCollapsed('DATE_LIMITS');
        this.dateLimits = this.sendingSrv.setDateLimits();
        console.log('dateLimits', this.dateLimits);
        console.groupEnd();
    }

    // depends of pickupDate
    // if today, set limit from current time
    // if in the future, set limit default
    private setTimeLimits() {
        console.groupCollapsed('TIME_LIMITS');
        let now = this.dateSrv.getIsoString();
        let fromMin;
        let toMin;
        let dateIsToday = this.dateSrv.isDateToday(this.sending.pickupDate);
        // console.log('is pickupDate today?', dateIsToday);
        if(dateIsToday) {
            // set limit from current time, rounded up
            let minutes = this.dateSrv.getMinuteNum(now);
            let hour = this.dateSrv.getHourNum(now);
            if(minutes>30) {
                fromMin = this.dateSrv.setTimeToDate(now, hour+1, 0);
            }else{
                fromMin = this.dateSrv.setTimeToDate(now, hour, 30);
            }
            toMin = this.dateSrv.addHours(fromMin, 2);
        }else{
            // set limit default
            fromMin = this.dateSrv.setTimeToDate(this.sending.pickupDate, 4, 0);
            toMin = this.dateSrv.setTimeToDate(this.sending.pickupDate, 6, 0);
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
        console.groupEnd();
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
                        this.navCtrl.setRoot(SendingsTabsPage);
                    }
                }
            ]
        });
        alert.present();        
    }

    private initForm() {
        console.log('- initForm');
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
        // aux
        this.pickupDatePreventLoopOn = false;    
    }

    private initAndPopulatePage() {
        console.groupCollapsed('INIT_POPULATE_PAGE');
        // map
        if(this.sending.pickupAddressSet==true) {
            console.log('- pickupAddress is set');
            var latlng = {
                lat: this.sending.pickupAddressLat,
                lng: this.sending.pickupAddressLng,
            }
            console.log('- map latlng', latlng);
            this.setMapCenter(latlng);
            this.addMapMarker(latlng);
        }else{
            console.log('- no pickupAddress set');
        }
        // address
        console.log('- populate form');
        this.pickupAddressFullText.setValue(this.sending.pickupAddressFullText);
        this.pickupAddressLine2.setValue(this.sending.pickupAddressLine2);        
        // contact
        this.pickupPersonName.setValue(this.sending.pickupPersonName);
        this.pickupPersonPhone.setValue(this.sending.pickupPersonPhone);
        this.pickupPersonEmail.setValue(this.sending.pickupPersonEmail);
        // PICKUP DATE      
        if(this.sending.pickupDate=='') {
            // not set, set with now
            this.resetDateTimeFromTo();
        }else{
            // is set, old?
            if(!this.sendingSrv.isPickupDateValid(this.sending.pickupDate, this.dateLimits.min, this.dateLimits.max)) {               
                console.log('pickupDate is not valid');
                this.resetDateTimeFromTo();
                let toast = this.toastCtrl.create({
                    message: 'ATENCIÓN: Fecha/horario de Retiro fueron ajustados',
                    duration: 3000,
                    position: 'bottom',
                    showCloseButton: true,
                    closeButtonText: 'OK'
                });
                toast.present();
            }else{
                // its ok, set from sending
                console.log('pickupDate is valid');
                this.setPickupDate(this.sending.pickupDate);
                this.setPickupTimeFrom(this.sending.pickupTimeFrom);
                this.setPickupTimeTo(this.sending.pickupTimeTo);
            }
        }
        console.groupEnd();
    }

    private populateAddressInput(fullAddress:string) {
        console.log('f2 > populateAddressInput > ', fullAddress);
        this.pickupAddressFullText.setValue(fullAddress);
    }

    private setPickupPersonData() {
        console.log('f2 > populate pickupContact with current user');
        let name = `${this.account.profile.data.firstName} ${this.account.profile.data.lastName}`;
        let phone = `${this.account.profile.data.phonePrefix} ${this.account.profile.data.phoneMobile}`;
        let email = this.account.profile.data.email;
        this.pickupPersonName.setValue(name);
        this.pickupPersonPhone.setValue(phone);
        this.pickupPersonEmail.setValue(email);        
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
        // city name hack
        // if city empty, set state short
        if(this.placeDetails.components.locality.short!='') {
            this.sending.pickupAddressCityShort = this.placeDetails.components.locality.short;
            this.sending.pickupAddressCityLong = this.placeDetails.components.locality.long;
        }else{
            console.log('pickup address city: set state name');
            this.sending.pickupAddressCityShort = this.placeDetails.components.administrative_area_level_1.short;
            this.sending.pickupAddressCityLong = this.placeDetails.components.administrative_area_level_1.short;
        }
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
        // pickupData is same as pickupFrom
        this.sending.pickupDate = this.pickupTimeFrom.value;
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
        if(!this.addressModal) {
            // set
            this.addressModal = this.modalCtrl.create(ModalSearchMapAddressPage, {
                            'modalTitle': 'Dirección de Retiro'
                        });                 
            // open
            this.addressModal.present();
            // on close
            this.addressModal.onDidDismiss(data => {
                console.log('onDidDismiss() param ', data);
                this.processAddressSearchResult(data);  
                this.addressModal = null;
            });
        }else{
            console.error('modal has been call twice, why?');
        }
    }

    private initPlaceDetails() {
        console.log('- initPlaceDetails');
        this.placeDetails = this.gmapsService.initPlaceDetails();
    }

    private processAddressSearchResult(item:any) {
        console.info('processAddressSearchResult');
        if(item){            
            // get place details with place_id
            this.setPlaceDetails(item.place_id);
        }else{
            // item is undefined, cant process
            console.error('processAddressSearchResult > undefined', item);
        }    
    }

    private setPlaceDetails(place_id:string) {
        console.info('f2 > setPlaceDetails > init');
        this.gmapsService.getPlaceDetails(place_id, this.map)
            .then((place) => {
                let details = this.gmapsService.inspectPlaceDetails(place);
                // console.log('details extracted > ', details);
                let isComplete:any = this.gmapsService.isPlaceAddressComplete(details);
                console.log('isComplete', isComplete);
                if(isComplete.passed) {
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
                    let failedTxt = isComplete.failed.toString();
                    let alert = this.alertCtrl.create({
                        title: 'Dirección incompleta',
                        subTitle: `Debe indicarse una dirección de retiro exacta,
                                   que incluya nombre de calle, númeración y ciudad. 
                                   Vuelve a intentarlo. (Datos faltantes: ${failedTxt})`,
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
        console.log('- initMap');
        let latlng = this.gmapsService.setlatLng(-34.603684, -58.381559);
        let divMap = (<HTMLInputElement>document.getElementById('mapf2'));
        this.map = this.gmapsService.initMap(latlng, divMap);
    }


    /**
     * AUX HELPERS
     */

    private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe((snap) => {
                                this.account = snap.val();
                            }, err => {
                                console.log('error', err);
                            });
    }    

    private getSendingFromParams() {
        console.groupCollapsed('SENDING_PARAMS');
        console.log(this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
        console.groupEnd();
    }

    private showTimeRangeToast(input:string, newTime:string) {
        let toast = this.toastCtrl.create({
            message: 'Se ajustó horario de "' + input + '" a "' + newTime + '", para mantener 2 horas de margen',
            duration: 6000,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'OK'
        });
        toast.present();    
    }

}
