import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';

@Component({
  selector: 'page-shipment-create-2',  
  templateUrl: 'shipment-create-2.html',
})
export class ShipmentCreate2Page {

  constructor(public navCtrl: NavController, 
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {

  }

  createShipment() {
    this.showAlert();
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Nueva Carga',
      message: 'Presiona confirmar para tomar el envío.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            console.log('Buy clicked');
            this.navCtrl.setRoot(ShipmentsPage);
            this.presentToast();
          }
        }
      ]
    });
    alert.present();
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: 'Tienes una nueva carga!',
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }
}
