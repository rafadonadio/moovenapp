import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';

@Injectable()
export class ShipmentsService {

    constructor(private authSrv:AuthService,
        private afDb: AngularFireDatabase) {
    }

    getAllActiveObs(snapshot: boolean = false): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userShipments/${accountId}/active`, { preserveSnapshot: snapshot });
    }

    getAllClosedObs(snapshot: boolean = false, limitToLast:number = 100): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userShipments/${accountId}/closed`, { 
            preserveSnapshot: snapshot,
            query: {
                orderByChild: 'timestamp',
                limitToLast: limitToLast
            }
        });
    }    

    getObs(shipmentId:string, snapshot:boolean = true): FirebaseObjectObservable<any> {
        return this.afDb.object(`shipments/${shipmentId}`, {
            preserveSnapshot: snapshot,
        });          
    }

    getAllNotifications(snapshot:boolean = false, limitToLast:number = 100): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userNotificationsByShipmentid/${accountId}`, { 
            preserveSnapshot: snapshot,
            query: {
                limitToLast: limitToLast
            } 
        });
    }

   /**
     * STRINGS
     */

    getStatusMessage(currentStageStatus) {
        let message:string = '--';
        switch (currentStageStatus) {
            case 'live_gotoperator':
            case 'live_waitpickup':
                message = 'Retirar Servicio';
                break;
            case 'live_pickedup':
                message = 'Retiro confirmado';
                break;
            case 'live_inroute':
                message = 'En transito';
                break;
            case 'live_dropped':
                message = 'Entrega confirmada';
                break;
            case 'closed_completed':
                message = 'Servicio completado';
                break;
            case 'closed_autocompleted':
                message = 'Servicio autocompletado';
                break;
            case 'closed_canceledbysender':
                message = 'Cancelado por Solicitante';
                break;
            case 'closed_canceledbyoperator':
                message = 'Concelado por Operador';
                break;
            case 'closed_payexpired':
                message = 'Venci?? antes del pago';
                break;
            case 'closed_waitoperatorexpired':
                message = 'Venci?? antes de tener Operador';
                break;                  
        }
        return message;
    }   

}
