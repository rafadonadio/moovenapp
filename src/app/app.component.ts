import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { StartPage } from '../pages/start/start';
import { SettingsPage } from '../pages/settings/settings';
import { SendingsPage } from '../pages/sendings/sendings';
import { ShipmentsPage } from '../pages/shipments/shipments';
import { PaymentPage } from '../pages/payment/payment';
import { HistorialPage } from '../pages/historial/historial';
import { NotificationsPage } from '../pages/notifications/notifications';
import { HelpPage } from '../pages/help/help';
import { SignupMergePage } from '../pages/signup-merge/signup-merge';

import { AngularFire } from 'angularfire2';
import { UsersService } from '../providers/users-service/users-service';
import { USER_CFG } from '../models/user-model';

import firebase from 'firebase';

declare var window: any;

const PROFILE_BASIC = USER_CFG.ACCOUNT.PROFILE.LIST.BASIC;

@Component({
    templateUrl: 'app.html'
})
export class MyApp{
    //@ViewChild(Nav) nav: Nav;
    @ViewChild(Nav) nav: Nav;
    // make StartPage the root (or first) page
    rootPage: any = StartPage;
    pages: Array < {
                    title: string,
                    component: any,
                    icon: string,
                    navigationType: string
                } >;
    loader:any;
    user:firebase.User;
    userAccount;      
    avatarDefault:string = 'assets/img/mooven_avatar.png';          

    constructor(public platform: Platform,
        public usersService: UsersService,
        public menu: MenuController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public af:AngularFire) {   

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need. 
            if (window.cordova) {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                StatusBar.styleDefault();
                console.log('app > cordova ready..');
                let array: string[] = platform.platforms();
                console.log(array);
                // let isAndroid: boolean = platform.is('android');
                // let isIos: boolean = platform.is('ios');
                // let isWindows: boolean = platform.is('windows');
            }
        });

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Servicios', component: SendingsPage, icon: 'send', navigationType: 'root' },
            { title: 'Operador', component: ShipmentsPage, icon: 'cube', navigationType: 'root' },
            { title: 'Pagos', component: PaymentPage, icon: 'card', navigationType: 'push' },
            { title: 'Historial', component: HistorialPage, icon: 'time', navigationType: 'push' },
            { title: 'Notificaciones', component: NotificationsPage, icon: 'notifications', navigationType: 'push' },
            { title: 'Ayuda', component: HelpPage, icon: 'help-circle', navigationType: 'push' },
            { title: 'Ajustes', component: SettingsPage, icon: 'settings', navigationType: 'push' }
        ];

        /**
         *  IS USER ALREADY LOGGED IN? GO HOME
         */
        let authInit = this.af.auth.subscribe((state) => {
            if(state) {
                this.nav.setRoot(SendingsPage);
            }
            authInit.unsubscribe();
        });

        /**
         *  FIREBASE AUTH OBSERVER
         */
        this.af.auth.subscribe((state) => {
            console.info('__authStateChanged');
                if (state) {
                    console.log('__authStateChanged > OK');
                    this.user = state.auth;
                    this.getUserAccount();
                    //this.runUserAccountVerification();
                } else {
                    console.log('__authStateChanged > NULL');
                    this.user = null;
                    this.userAccount = null;
                }
            });        
    }


    private getUserAccount() {
        console.log('__[1]__getUserAccount');
        this.usersService.getAccount()
            .then((snapshot) => {
                this.userAccount = snapshot.val();
                if(this.userAccount === null) {
                    console.error('__[1]__NULL');
                    this.presentAlertAndAction('Cuenta inválida',
                        'Lo sentimos, esta cuenta es inválida, vuelve a registrarte o intenta de nuevo. ',
                        'signout'
                        );                 
                }else{
                    console.log('__[1]__OK');
                }                
            })
            .catch((error) => console.log('error', error));        
    }

    /**
     *  USER ACCOUNT VERIFICATION 
     *  1- get user account
     *  2- check account is active
     *  3- check profile.basic is complete 
     */
    private runUserAccountVerification() {
        console.info('__[0]__AccountVerification');
        // show loader
        this.presentLoader('Verificando credenciales ...');
        // get account data
        this.usersService.getAccount()
            .then((snapshot) => {
                this.userAccount = snapshot.val();
                if(this.userAccount === null) {
                    console.error('__[1]__getUserAccount: NULL, SignOut');
                    this.presentAlertAndAction('Cuenta inválida',
                        'Lo sentimos, esta cuenta es inválida, vuelve a registrarte o intenta de nuevo. ',
                        'signout'
                        );                 
                }else{
                    console.log('__[1]__getUserAccount');
                    this.loader.dismiss()
                        .then(() => {
                            // is user active?
                            console.info('__[2]__isAccountActive');
                            // if(this.usersService.accountIsActive(this.userAccount)===false) {
                            //     // account is inactive, show error and signout
                            //     console.log('UserAccount active==FALSE, SignOut');
                            //     this.presentAlertAndAction('Cuenta inactiva',
                            //         'Lo sentimos, esta cuenta esta inactiva, no es posible ingresar',
                            //         'signout'
                            //         );
                            // }else{
                            //     console.log('UserAccount active==TRUE');
                            // }
                            // return;
                        })
                        .then(() => {
                            // is basic profile complete ? 
                            console.info('__[3]__accountProfileIsComplete');
                            // if(this.usersService.accountProfileFieldsIsComplete(this.userAccount, PROFILE_BASIC)===false) {
                            //     console.warn('profileIsComplete==FALSE, goTo MergePage');
                            //     this.nav.setRoot(SignupMergePage);
                            // }
                            // else{
                            //     console.log('profileIsComplete==TRUE');
                            //     // all good, audit if account email is verified
                            //     //>>>>>>this.auditAccountEmailIsVerified();                                
                            // }                    
                        })
                        .catch((error) => console.log('error', error));    
                }                         
            })
            .catch((error) => {
                console.error('verifyUserAccount > failed', error);
                
            });     
    }

    /**
     * USER ACCOUNT HELPER
     */

    /**
     * Check email verification in 3 steps
     * 1- check profile.verifications.email.verified == true
     * 2- if false, check value of firebase.User.emailVerified
     * 3- update account verification to whatever is
     */
    auditAccountEmailIsVerified(): void {
        let self = this;
        if(this.userAccount.hasOwnProperty('profile')===false) {
            console.error('auditAccountEmailIsVerified > Account == ', this.userAccount);            
        }else{
            console.info('__auditAccountEmailIsVerified > (this.userAccount)', this.userAccount);
            let ref = this.usersService.getRef_AccountEmailVerification();
            ref.once('value', function(snapshot) {
                console.log('profile.verification.email.verified == ', snapshot.val());
                let isVerified:boolean = snapshot.val();
                if(isVerified === false) {                 
                    self.usersService.runAuthEmailVerification()
                        .then((result) => {
                            console.log('checkAuthEmailIsVerified > ', result);                           
                        })
                        .catch((error) => {
                            console.log('checkAuthEmailIsVerified > error > ', error);                            
                        });
                }
            });
        }
    }


    /**
     *  NAVIGATION
     */

    openPage(page): void {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // audit if account email is verified
        this.auditAccountEmailIsVerified();
        // navigate to the new page if it is not the current page
        switch(page.navigationType) {
            case 'root':
                this.nav.setRoot(page.component);
                break;
            case 'push':
                this.nav.push(page.component);
                break;
        }
    }

    goToSettings():void {
        this.menu.close();
        this.nav.push(SettingsPage);
    }

    /**
     *  HELPERS
     */

    presentLoader(msg: string): void {
        this.loader = this.loadingCtrl.create({
          content: msg,
          dismissOnPageChange: true
        });
        this.loader.present();
    }

    presentAlertAndAction(title:string, subtitle:string, action: string):void {
        console.log('present alert > ', action);
        var self = this;
        let alertError = this.alertCtrl.create({
            title: title,
            subTitle: subtitle,
            buttons: [{
                text: 'Cerrar',
                role: 'cancel',
                handler: () => {
                    self.alertActionTrigger(action);
                }
            }]
        });
        alertError.present();
    }

    alertActionTrigger(action: string): void {
        switch(action){
            case 'signout':
                this.usersService.signOut();
                break;
            default:
                console.log('app > alertActionTrigger not found > ', action);
        }
    }

}
