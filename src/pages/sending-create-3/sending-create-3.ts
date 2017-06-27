import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';
import { GoogleMapsService } from '../../providers/google-maps-service/google-maps-service';
import { DateService, DATE_DEFAULTS, DATES_NAMES } from '../../providers/date-service/date-service';

import { SendingsPage} from '../sendings/sendings';
import { SendingCreate2Page} from '../sending-create-2/sending-create-2';
import { SendingCreate4Page} from '../sending-create-4/sending-create-4';
import { ModalSearchMapAddressPage } from '../modal-search-map-address/modal-search-map-address';

const MIN_TIMEDIFF_MINUTES = DATE_DEFAULTS.PICKUP_DROP_MIN_DIFF_IN_MINUTES;
const DATES_TXT = DATES_NAMES;

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
    form: FormGroup;
    dropAddressFullText: any;
    dropAddressLine2: any;    
    dropTimeFrom: any;
    dropTimeTo: any;
    dropPersonName: any;
    dropPersonPhone: any;
    dropPersonEmail: any;
    // form aux
    showErrors:boolean = false;
    monthNames: any = DATES_TXT.monthNames.es;
    monthShortNames: any = DATES_TXT.monthShortNames.es;
    dayNames: any = DATES_TXT.dayNames.es;
    dayShortNames: any = DATES_TXT.dayShortNames.es;
    timeLimits:any;
    addressModal:any;
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
        this.initForm();
        // set sending from param
        this.getSendingFromParams();
        // populate page
        this.initAndPopulatePage();
        this.setTimeLimits();        
    }

    /**
     * MAIN ACTIONS
     */

    goBack() {
        this.update();
        this.goBacktoStep2();
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

    changeDropTimeFrom() {
        this.runDropTimeFromChange();
    }

    changeDropTimeTo() {
        this.runDropTimeToChange();
    }  


    /// PRIVATE METHODS

    /**
     *  DROP DATE
     */

    /**
     *  DROP TIME-FROM
     */

    private runDropTimeFromChange() {
        console.group('runDropTimeFromChange');
        let newTo;
        let from = this.dropTimeFrom.value;
        let to = this.dropTimeTo.value
        let diff = this.dateSrv.getDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            newTo = this.dateSrv.addMinutes(from, MIN_TIMEDIFF_MINUTES);
            this.setDropTimeTo(newTo);
            this.showTimeRangeToast('Hasta', this.dateSrv.getTimeFromDate(newTo));
        }
        console.log('diff, from, to, newTo', diff, from, to, newTo);              
        console.groupEnd();
    }

    private setDropTimeFrom(isoDate: string) {
        this.setFormDropTimeFrom(isoDate);
        this.setSendingDropTimeFrom(isoDate);
    }
    private setFormDropTimeFrom(isoDate: string) {
        this.dropTimeFrom.setValue(isoDate);
    }
    private setSendingDropTimeFrom(isoDate:string) {
        this.sending.dropTimeFrom = isoDate;
    }

    /**
     *  DROP TIME-TO
     */

    private runDropTimeToChange() {
        console.group('runDropTimeToChange');
        let newFrom;
        let from = this.dropTimeFrom.value;
        let to = this.dropTimeTo.value
        let diff = this.dateSrv.getDiff(from, to);
        if(diff < MIN_TIMEDIFF_MINUTES) {
            newFrom = this.dateSrv.subtractMinutes(to, MIN_TIMEDIFF_MINUTES);
            this.setDropTimeFrom(newFrom);
            this.showTimeRangeToast('Desde', this.dateSrv.getTimeFromDate(newFrom));
        }
        console.log('diff, from, to, newFrom', diff, from, to, newFrom);              
        console.groupEnd();
    }

    private setDropTimeTo(isoDate: string) {
        this.setFormDropTimeTo(isoDate);
        this.setSendingDropTimeTo(isoDate);
    }
    private setFormDropTimeTo(isoDate: string) {
        this.dropTimeTo.setValue(isoDate);
    }
    private setSendingDropTimeTo(isoDate:string) {
        this.sending.dropTimeTo = isoDate;
    }

    /**
     *  DATETIME HELPERS
     */

    private isAdateOlderThanBdate(a:any, b:any) {
        let isOld = this.dateSrv.isBeforeThan(a, b);
        console.log('isAdateOlderThanBdate', isOld, a, b);
        return isOld;
    }

    // set TimeFrom = pickupDate
    // set TimeTo = TimeFrom+2hr
    private setTimeLimits() {
        console.group('setTimeLimits');
        let fromMin = this.sending.pickupDate;
        let toMin = this.dateSrv.addMinutes(fromMin, MIN_TIMEDIFF_MINUTES);
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
     *  FORM HELPERS
     */

    private submitForm() {
        console.log('f3 > submit');
        if(!this.form.valid) {
            console.log('f3 > submit > invalid');
            this.showErrors = true;
        }else{
            console.log('f3 > submit > valid');
            this.showErrors = false;
            this.update();
            this.goToNextStep();
        }    
    }

    private cancelSending() {
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

    private initForm() {
        this.form = this.formBuilder.group({
            'dropAddressFullText': ['', Validators.compose([Validators.required])],
            'dropAddressLine2': ['', Validators.compose([Validators.maxLength(100)])],
            'dropTimeFrom': ['', Validators.compose([Validators.required])],
            'dropTimeTo': ['', Validators.compose([Validators.required])],
            'dropPersonName': ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
            'dropPersonPhone': ['', Validators.compose([Validators.required])],
            'dropPersonEmail': ['', Validators.compose([EmailValidator.isValid])],
        });
        this.dropAddressFullText = this.form.controls['dropAddressFullText'];
        this.dropAddressLine2 = this.form.controls['dropAddressLine2'];        
        this.dropTimeFrom = this.form.controls['dropTimeFrom'];
        this.dropTimeTo = this.form.controls['dropTimeTo'];
        this.dropPersonName = this.form.controls['dropPersonName'];
        this.dropPersonPhone = this.form.controls['dropPersonPhone'];
        this.dropPersonEmail = this.form.controls['dropPersonEmail'];        
    }

    private initAndPopulatePage() {
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
        // contact
        this.dropPersonName.setValue(this.sending.dropPersonName);
        this.dropPersonPhone.setValue(this.sending.dropPersonPhone);
        this.dropPersonEmail.setValue(this.sending.dropPersonEmail);

        // DATE AUX
        let from = this.sending.pickupDate;
        if(this.sending.dropTimeFrom=='') {
            // not set, set with now
            this.setDropTimeFrom(from);
        }else{
            if(this.isAdateOlderThanBdate(this.sending.dropTimeFrom, from)) {
                this.setDropTimeFrom(from);
                let toast = this.toastCtrl.create({
                    message: 'ATENCIÓN: horario de Entrega fue ajustado',
                    duration: 3000,
                    position: 'bottom',
                    showCloseButton: true,
                    closeButtonText: 'OK'
                });
                toast.present();                
            }else{
                this.setDropTimeFrom(this.sending.dropTimeFrom);
            }
        }
        if(this.sending.dropTimeTo=='') {
            // not set, set with from+2hr
            let fromPlus = this.dateSrv.addMinutes(from, MIN_TIMEDIFF_MINUTES);
            this.setDropTimeTo(fromPlus);
        }else{
            let diff = this.dateSrv.getDiff(this.sending.dropTimeFrom, this.sending.dropTimeTo);
            if(diff<MIN_TIMEDIFF_MINUTES){
                let fromPlus = this.dateSrv.addMinutes(from, MIN_TIMEDIFF_MINUTES);
                this.setDropTimeTo(fromPlus);
            }else{
                this.setDropTimeTo(this.sending.dropTimeTo);
            }
        }        

    }

    private populateAddressInput(fullAddress:string) {
        console.log('f2 > populateAddressInput > ', fullAddress);
        this.dropAddressFullText.setValue(fullAddress);
    }

    private setPickupPersonData() {
        console.log('f3 > populate dropContact with current user');
        this.dropPersonName.setValue(this.user.displayName);
        this.dropPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.dropPersonEmail.setValue(this.user.email);
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
     * SUBMIT UPDATES
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
        console.info('f3 > initPlaceDetails');
        this.placeDetails = this.gmapsService.initPlaceDetails();
    }

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
                let details = this.gmapsService.inspectPlaceDetails(place);
                console.log('details extracted > ', details);
                let isComplete:any = this.gmapsService.isPlaceAddressComplete(details);
                console.log('isComplete', isComplete);
                if(isComplete.passed) {
                    let latlng = this.gmapsService.setlatLng(details.lat, details.lng);
                    this.setMapCenter(latlng);
                    this.addMapMarker(latlng); 
                    // populate0
                    this.placeDetails = details;
                    this.placeDetails.set = true;
                    this.placeDetails.complete = true;
                    this.populateAddressInput(details.full_address);
                    // save
                    this.updateAddressDetails();                           
                }else{
                     console.error('f3 > address incomplete ');
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
     * AUX HELPERS
     */

    private setUser(){
        this.user = this.users.getUser();
        // set profile
        this.users.getAccountProfileData()
            .then((snapshot) => {
                this.profile = snapshot.val();
            })
            .catch(error => console.log(error));
    }

    private getSendingFromParams() {
        console.log('f3 > get navParams > this.sending');
        console.log('f3 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
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

}
