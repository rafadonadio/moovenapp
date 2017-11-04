import { Subscription } from 'rxjs/Rx';
import { SendingRequestLiveSummary } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController, ViewController } from 'ionic-angular';
import { ShipmentsTabsPage } from '../shipments-tabs/shipments-tabs';
import { ShipmentCreate2Page } from '../shipment-create-2/shipment-create-2';
import { SendingService } from '../../providers/sending-service/sending-service';
import {
    GMAP_CFG,
    GoogleMapsService,
    MapsMapOptions,
    MapsMapPolylineOptions
} from '../../providers/google-maps-service/google-maps-service';
import { DateService } from '../../providers/date-service/date-service';

@Component({
    selector: 'page-shipment-create',
    templateUrl: 'shipment-create.html',
})
export class ShipmentCreatePage implements OnInit {

    vacants;
    vacantsExpired;
    vacantSubs:Subscription;
    vacantSelected: VacantSelected;
    // aux
    loader:any;     
    // geofire
    geoFire: any;
    geoFireQuery: any;    
    // maps dates
    flagDatesInitiated: boolean;
    flagDatesExist: boolean;
    datesListSubs: Subscription;
    datesList: Array<any>;
    dateIndexSelected: number;
    dateChange: boolean;
    mapDate: MapDate;  
    // map center
    mapCenterList: Array<any>;
    mapCenterSelected: number;
    mapCenterChange: boolean;
    mapCenter: any;
    // map 
    map: any;
    mapMarkers = {
        list:[],
        selected:''
    };
    routeLine: any;
    checkeredMarker: any;

    constructor(public navCtrl: NavController,
        public gmapsService: GoogleMapsService,
        public dateSrv: DateService,
        public sendingSrv:SendingService,
        public alertCtrl: AlertController,
        public loaderCtrl: LoadingController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController) {

    }

    ngOnInit() {   
        console.log('ngOnInit');
        this.showLoading('Consultando servicios ...');
        this.resetVacantSelected();
        this.resetMapDates();
        this.initMapCenterSelected();     
        this.initMap();
        this.runMapDatesSubcription(); 
    }

    ionViewWillEnter() {      
        console.log('ionViewWillEnter');
        this.flagDatesInitiated = false; 
    }

    ionViewWillLeave() {
        this.unsubscribe();
    }

    // navigation
    goBack() {
        this.navCtrl.setRoot(ShipmentsTabsPage);
    }

    /**
     * VACANT SELECTED
     */

    private resetVacantSelected() {
        this.vacantSelected = {
            set: false,
            dateSlug: '',
            sendingId: ''
        }
    }

    /**
     *  MAP DATES
     */
    changeMapDate() {
        console.log('Map');  
        this.dateChange = true;    
    }
    setMapDate(index = null) {
        this.dateIndexSelected = index==null ? this.dateIndexSelected : index;
        this.mapDate = this.datesList[this.dateIndexSelected];        
        this.dateChange = false;
        console.log('setMapDate (index, dateIndexSelected, mapDate)', index, this.dateIndexSelected, this.mapDate);
    }
    private resetMapDates() {
        this.mapDate = null;
        this.flagDatesExist = false;
        this.datesList = [];
        this.dateIndexSelected = null;
        this.dateChange = false; 
    } 

    /**
     *  MAP CENTER
     */
    changeMapCenter() {
        console.log('changeMapCenter');  
        this.mapCenterChange = true;    
    }
    setMapCenter(index) {
        console.log('setMapCenter', index);
        this.mapCenterSelected = index;
        this.mapCenter = this.mapCenterList[this.mapCenterSelected];        
        this.mapCenterChange = false;
    }
    private initMapCenterSelected() {
        this.mapCenterSelected = 0;
        this.mapCenterList = GMAP_CFG.POINTS;
        this.mapCenter = this.mapCenterList[this.mapCenterSelected];
        this.mapCenterChange = false;
    }     

    /**
     *  GEOFIRE
     */
    private runMapDatesSubcription() {
        // dates observable
        let obs = this.sendingSrv.getGeofireLiveDatesObs(true);
        // subcription
        this.datesListSubs = obs.subscribe(snaps => {
            console.log('datesList subs ...');
            // initial flags
            this.flagDatesInitiated = true;
            this.closeLoading();
            // aux arrays
            let auxDatesSlugs = [];
            let auxDatesList = [];
            // iterate suscription snapshot
            snaps.forEach(child => {
                // set map date Obj
                let dateSlug:string = child.key;
                let dates = child.val();
                //console.log('child.val:dates', dateSlug, dates);
                let dateMonth = dateSlug.substr(0,2); // extract month from string
                let dateDay = dateSlug.substr(3,2);   // extract day from string
                let date:MapDate = {
                    dateSlug: dateSlug,
                    dateString: `${dateDay}/${dateMonth}`,
                    dateCalendar: this.dateSrv.displayCalendarTime(dateDay, dateMonth),
                    list: dates,
                    keys: Object.keys(dates)
                }
                auxDatesSlugs.push(dateSlug);
                auxDatesList.push(date);
            });
            console.log('aux[]', auxDatesSlugs, auxDatesList);
            
            // set mapDate index
            let mapDateIndex = 0;
            if(this.mapDate) {
                // mapDate is previously set
                const currentMapDateIndexInAux = auxDatesSlugs.findIndex(x => x == this.mapDate.dateSlug);
                if(currentMapDateIndexInAux>-1) {
                    // current mapDate still available
                    mapDateIndex = currentMapDateIndexInAux;
                }else{
                    // current mapDate no longer available
                    this.showToast(`En este momento, para "${this.mapDate.dateCalendar}" no hay Servicios disponibles`, 2000, 'middle');
                }
            }
            console.log('mapDateIndex', mapDateIndex);            
            // dateslist
            if(auxDatesList.length>0) {
                // dates available, set
                this.datesList = auxDatesList.concat([]); 
                this.setMapDate(mapDateIndex);
                this.flagDatesExist = true;
            }else{
                // no dates available, reset
                if(this.datesList.length>0) {
                    this.showToast(`En este momento no hay Servicios disponibles`, 2000, 'bottom');
                }
                this.resetMapDates();                
            }
            this.runGeofire(); 
            console.log('datesList', this.datesList);       
        }, error =>{
            console.log('datesListSubs error', error);
        });
    }

    private runGeofire() {
        console.log('runGeofire');
    }

    /**
     *  SENDING SELECT
     */

    select(sendingVacantId:string, sendingVacantData:any) {
        // check if it hasnt expired
        const hasExpired = this.sendingSrv.hasVacantExpired(sendingVacantData);
        console.log('check expired before lock', hasExpired);
        if(hasExpired) {
            let alert = this.alertCtrl.create({
                title: 'El Servicio ha expirado',
                subTitle: 'No es posible tomar el Servicio porque ha expirado, por favor intenta seleccionar otro Servicio disponible.',
                buttons: ['Cerrar']
            });
            alert.present();
            // reload subscription
            this.unsubscribe();
            this.initMap();
            this.getVacants();
            return;
        }
        // all good, go
        // init loader
        let loader = this.loaderCtrl.create({
            content: 'verificando disponibilidad ...'
        });
        loader.present();
        // process attempt
        this.sendingSrv.attemptToLockVacant(sendingVacantId)
            .then((result) => {
                console.log('attempt result > ', result);
                if(result.didLock===true) {
                    loader.dismiss()
                        .then(() => {
                            this.goToConfirm(sendingVacantId, sendingVacantData);
                        });
                }else if(result.isTaken===true) {
                    let title = 'Servicio tomado';
                    let message = `El servicio ya ha sido tomado y esta siendo procesado. Por favor selecciona otro servicio.`;
                    loader.dismiss()
                        .then(() => {
                            this.showAlertAndCancel(title, message);
                        });                    
                }else if(result.didLock===false) {
                    let timeLeft = Math.round(result.lockTimeLeft);
                    let title = 'No disponible';
                    let message = `El servicio esta siendo visualizado por otro operador en este preciso momento. 
                                    Si el otro operador no lo confirma podras volver a intentarlo en ${timeLeft} segundos`;
                    loader.dismiss()
                        .then(() => {
                            this.showAlertAndCancel(title, message);
                        });                    
                }
            })
            .catch((result)=> {
                console.log('attempt error > ', result);
                let title = 'Error';
                let message = 'Ocurrió un error al intentar seleccionar el servicio, por favor vuelve a intentarlo';
                loader.dismiss()
                    .then(() => {
                        this.showAlertAndCancel(title, message);
                    });
            });      

    }



    selectedToggle(vacant:any) {
        // toggle: if already selected, de-selelect
        if(this.mapMarkers.selected !== vacant.key) {
            let sendingId = vacant.key;
            let live:SendingRequestLiveSummary = vacant.data;
            let pickupLatLng = this.gmapsService.setlatLng(live.pickupAddressLat, live.pickupAddressLng);
            let dropLatLng = this.gmapsService.setlatLng(live.dropAddressLat, live.dropAddressLng);            
            // center map and zoom
            this.map.panTo({
                lat: live.pickupAddressLat,
                lng: live.pickupAddressLng
            })
            // position map to show complete polyline
            let bounds = this.gmapsService.initLatLngBounds();
            bounds.extend(pickupLatLng);
            bounds.extend(dropLatLng);
            this.map.fitBounds(bounds);
            //this.map.setZoom(12);
            // set current marker selected
            this.setMarkerSelected(sendingId);
            this.addMapMarkerCheckered(dropLatLng);
            // draw polyline
            let coordinates = [pickupLatLng, dropLatLng];
            let routeLineCfg: MapsMapPolylineOptions = {
                path: coordinates,
                geodesic: true,
                strokeColor: 'red',
                strokeOpacity: 0.8,
                strokeWeight: 3
            };
            this.routeLine = this.gmapsService.initPolyline(routeLineCfg);
            this.routeLine.setMap(this.map); 
        }else{
            this.resetSelected();
            this.resetMapCenter();
        }
    }

    /**
     *  GET
     */

    private getVacants() {
        let obs = this.sendingSrv.getLiveVacantObs(true);
        this.vacantSubs = obs.subscribe(snaps => {
            this.vacants = [];
            this.vacantsExpired = [];
            if(snaps) {
                snaps.forEach(snap => {
                    let key = snap.key;
                    let value = snap.val();
                    //console.log('vacants', key, value);
                    let item = {
                        key: key,
                        data: value
                    }
                    // check is expired
                    const hasExpired = this.sendingSrv.hasVacantExpired(value);
                    if(hasExpired) {                               
                        this.vacantsExpired.push(item);          
                    }else{
                        this.vacants.push(item);
                        //add markers to map
                        let latlng = {
                            lat: value.pickupAddressLat,
                            lng: value.pickupAddressLng,
                        }
                        this.addMapMarker(latlng, key); 
                    }
                });
            }
            console.log('vacantsExpired', this.vacantsExpired);
        });
    }

    private goToConfirm(sendingId:string, sendingData:any) {
        this.navCtrl.setRoot(ShipmentCreate2Page, {
            sendingId: sendingId,
            sending: sendingData
        });        
    }

    /**
     *  MAP
     */

    private setMarkerSelected(key) {
        this.resetSelected();
        this.mapMarkers.selected = key;
        this.mapMarkers.list[key].setIcon(GMAP_CFG.ICONS.SELECTED);
    }

    private resetSelected() {
        if(this.mapMarkers.selected!=='') {
            this.mapMarkers.list[this.mapMarkers.selected].setIcon(GMAP_CFG.ICONS.DEFAULT);
            this.mapMarkers.selected = '';
            this.routeLine.setMap(null);
            this.removeMapMarkerCheckered();
        }        
    }

    private removeMapMarkerCheckered() {
        this.checkeredMarker.setMap(null);
    }

    private addMapMarkerCheckered(latLng:any):void {
        this.checkeredMarker = this.gmapsService.addMapMarker(latLng, this.map, GMAP_CFG.ICONS.CHECKERED);
    }

    private addMapMarker(latlng:any, key:string):void {
        console.info('addMapMarker');
        let marker = this.gmapsService.addMapMarker(latlng, this.map);
        this.mapMarkers.list[key] = marker;
    }  

    private getMapDefaultSettings():MapDefaultSettings{
        let settings:MapDefaultSettings = {
            latlng: this.gmapsService.setlatLng(GMAP_CFG.DEFAULT_CENTER.LAT, GMAP_CFG.DEFAULT_CENTER.LNG),
            zoom: 11                
        }
        return settings;
    }

    private resetMapCenter():void {
        let settings = this.getMapDefaultSettings();
        this.map.setCenter(settings.latlng);
        this.map.setZoom(settings.zoom);
    }

    private initMap() {
        console.info('initMap');
        let latlng = this.gmapsService.setlatLng(this.mapCenter.lat, this.mapCenter.lng);
        let divMap = (<HTMLInputElement>document.getElementById('maps1'));
        let options:MapsMapOptions = {
            zoom: this.mapCenter.zoom,
            maxZoom: 16, 
            minZoom: 8,
            draggable:true
        }
        // init map
        this.map = this.gmapsService.initMap(latlng, divMap, options);
    }      

    /**
     *  HELPERS
     */

    private showAlertAndCancel(title:string, message:string):void {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: ['Cerrar']
        });
        alert.present();
    }  

    private unsubscribe() {
        if(this.vacantSubs) {
            console.log('vacantSubs Unsubscribed');
            this.vacantSubs.unsubscribe();
        }
        if(this.datesListSubs) {
            console.log('datesListSubs Unsubscribed');
            this.datesListSubs.unsubscribe();
        }
        this.vacants = null;
        this.datesList = null;
        this.vacantsExpired = null;        
    }

    private showLoading(text:string) {
        this.loader = this.loaderCtrl.create({
            content: text
        });
        this.loader.present();
    }

    private closeLoading() {
        if(this.loader) {
            this.loader.dismiss();
            this.loader.onDidDismiss(() => {
                this.loader = null;
            });            
        }
    }

    private showToast(message:string, duration:number = 1500, position:string = 'bottom') {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration,
            position: position
        });
        toast.present();
    }

}

export class MapDefaultSettings {
    latlng:any;
    zoom: number;
}

export class MapDate {
    dateSlug:string;
    dateString:string;
    dateCalendar:string;
    list: Array<any>;
    keys:Array<any>;    
}

export class VacantSelected {
    set:boolean;
    dateSlug:string;
    sendingId:string;
}