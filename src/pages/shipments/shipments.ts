import { UsersService } from '../../providers/users-service/users-service';
import { UserAccount } from '../../models/user-model';
import { SendingsPage } from '../sendings/sendings';
import { AlertController } from 'ionic-angular/components/alert/alert';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

@Component({
    selector: 'page-shipments',
    templateUrl: 'shipments.html',
})
export class ShipmentsPage implements OnInit{

    sectionEnabled:boolean;
    shipments:any;
    shipmentsEmpty:boolean;
    shipmentsSuscription:any;   
    accountStatus: any;

    constructor(private navCtrl: NavController,
        public shipmentsSrv:ShipmentsService,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public users: UsersService) {}

    ngOnInit() {
        console.info('__SHP__shipments');
        this.viewCtrl.willEnter.subscribe( () => {
            console.log('__SHP__willEnter()');
            this.isUserGranted()
                .then((result:any) => {
                    console.log('result', result);
                    if(result.enabled == true) {
                        this.sectionEnabled = true;
                        this.getAllActive();            
                    }else{
                        this.showBlockMessage();
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('__SHP__didLeave()');
            if(this.sectionEnabled) {
                this.shipmentsSuscription.unsubscribe();
            }
        });                
    }

    private isUserGranted() {
        // init
        this.sectionEnabled = false;
        let steps = {
            reload: false,
            account: false,
            enabled: false,
            error: false,
            errorCode: ''
        }
        let account: UserAccount;        
        // get data
        return new Promise((resolve, reject) => {
            this.users.reloadUser()
                .then(() => {
                    steps.reload = true;
                    return this.users.getAccount();
                })
                .then((snapshot) => {
                    steps.account = true;
                    account = snapshot.val();              
                    this.accountStatus = this.users.accountProfilesStatus(account); 
                    if(this.accountStatus.hasOwnProperty('operator') && this.accountStatus.operator == true) {
                        steps.enabled = true;
                    }else{
                        steps.error = true;
                        steps.errorCode = 'operator_property_false_or_not_found';
                    }
                    resolve(steps);         
                })
                .catch((error) => {
                    steps.error = true;
                    steps.errorCode = 'get_account_failed';
                    resolve(steps);
                }); 
        });
    }

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        this.navCtrl.push(ShipmentDetailPage, { 
            shipmentId: data.shipmentId,
            sendingId: data.sendingId,
        });         
    }

    goToCreate() {
        this.navCtrl.setRoot(ShipmentCreatePage);
    }

    getStatusMessage(currentStageStatus) {
        let message = '';
        switch(currentStageStatus){
            case 'live_gotoperator':
            case 'live_waitpickup':
                message = 'Retirar';
                break;
            case 'live_pickedup':                
            case 'live_inroute':
                message = 'Entregar';
                break;                
            case 'live_dropped':
            case 'closed_completed':
                message = 'Entregado';
                break;                             
        }
        return message;
    }

    /**
     *  PRIVATE
     */

    private getAllActive() {
        let listRef = this.shipmentsSrv.getAllMyActiveRef();
        this.shipmentsSuscription = listRef.subscribe(snapshots => {
                console.log('__SHP__ getAllActive');                
                this.shipments = [];
                if(snapshots) {
                    snapshots.forEach(snapshot => {
                        let key = snapshot.key;
                        let item = {
                            key: key,
                            data: snapshot.val(),
                        };
                        this.shipments.push(item); 
                    });
                }
                if(this.shipments.length > 0) {
                    this.shipmentsEmpty = false;
                }else{
                    this.shipmentsEmpty = true;
                }
            });
    }

    private showBlockMessage() {
        let alert = this.alertCtrl.create({
            title: '¿Querés registrarte como Operador?',
                message: 'Envíanos un email con tus datos a contacto@moovenapp.com y te contamos como unirte.',
                buttons: [{ 
                    text: 'Volver',
                    role: 'cancel',
                    handler: () => {
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }]
            });
        alert.present();        
    }
}
