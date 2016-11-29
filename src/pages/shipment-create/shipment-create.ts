import { SendingRequestLiveSummary } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';
import { ShipmentCreate2Page } from '../shipment-create-2/shipment-create-2';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import {
    GMAP_CFG,
    GoogleMapsService,
    MapsMapOptions,
    MapsMapPolylineOptions
} from '../../providers/google-maps-service/google-maps-service';
import { DateService } from '../../providers/date-service/date-service';
import { UsersService } from '../../providers/users-service/users-service';

@Component({
    selector: 'page-shipment-create',
    templateUrl: 'shipment-create.html',
})
export class ShipmentCreatePage implements OnInit {

    vacants = [];
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
        public users: UsersService,
        public shipSrv:ShipmentsService,
        public sendingSrv:SendingService,
        public alertCtrl: AlertController,
        public loaderCtrl: LoadingController) {

    }

    ngOnInit() {
        // set map
        this.initMap();
        /// get vacants
        this.getVacants();
    }

    select(sendingVacantId:string, sendingVacantData:any) {
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

    goBack() {
        this.navCtrl.setRoot(ShipmentsPage);
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
        let ref = this.sendingSrv.getLiveVacantRef();
        ref.on('child_added', (data) => {
            this.vacants.push({key:data.key, data: data.val()});
            console.log('getVacants > data', this.vacants);
            // add markers to map
            let latlng = {
                lat: data.val().pickupAddressLat,
                lng: data.val().pickupAddressLng,
            }
            this.addMapMarker(latlng, data.key);
        })
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
            latlng: this.gmapsService.setlatLng(GMAP_CFG.POINTS.CABA.LAT, GMAP_CFG.POINTS.CABA.LNG),
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
        let settings = this.getMapDefaultSettings()
        let latlng = settings.latlng;
        let divMap = (<HTMLInputElement>document.getElementById('maps1'));
        let options:MapsMapOptions = {
            zoom: 11,
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

}

export class MapDefaultSettings {
    latlng:any;
    zoom: number;
}