import { Observable, Subscription } from 'rxjs/Rx';
import { AccountService } from '../providers/account-service/account-service';
import { AuthService } from '../providers/auth-service/auth-service';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StartPage } from '../pages/start/start';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { SendingsPage } from '../pages/sendings/sendings';
import { ShipmentsPage } from '../pages/shipments/shipments';
import { PaymentPage } from '../pages/payment/payment';
import { HistorialPage } from '../pages/historial/historial';
import { NotificationsPage } from '../pages/notifications/notifications';
import { HelpPage } from '../pages/help/help';
import { SignupMergePage } from '../pages/signup-merge/signup-merge';

import { UsersService } from '../providers/users-service/users-service';
import { USER_CFG, UserAccount } from '../models/user-model';

import { AngularFireAuth } from 'angularfire2/auth';

import firebase from 'firebase';

declare var window: any;

const PROFILE_BASIC = USER_CFG.ACCOUNT.PROFILE.LIST.BASIC;

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    //@ViewChild(Nav) nav: Nav;
    @ViewChild(Nav) nav: Nav;
    // make StartPage the root (or first) page
    rootPage: any = StartPage;
    pages: Array<{
        title: string,
        component: any,
        icon: string,
        navigationType: string
    }>;
    loader: any;
    user: firebase.User;
    account: UserAccount;
    accountSubs: Subscription;
    avatarDefault: string = 'assets/img/mooven_avatar.png';
    
    userAccount; // delete

    constructor(public platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        public menu: MenuController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public afAuth: AngularFireAuth,
        public usersService: UsersService,
        public authSrv: AuthService,
        public accountSrv: AccountService) {

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need. 
            if (window.cordova) {
                // Okay, so the platform is ready and our plugins are available.
                // Here you can do any higher level native things you might need.
                statusBar.styleDefault();
                splashScreen.hide();
                console.log('__CVA__ cordova ready');
                let array: string[] = platform.platforms();
                console.log('__CVA__', array);
                // let isAndroid: boolean = platform.is('android');
                // let isIos: boolean = platform.is('ios');
                // let isWindows: boolean = platform.is('windows');
            }
        });

        // used for an example of ngFor and navigation
        this.pages = [
            { title: 'Mooven', component: HomePage, icon: 'home', navigationType: 'root' },
            { title: 'Servicios', component: SendingsPage, icon: 'send', navigationType: 'root' },
            { title: 'Operador', component: ShipmentsPage, icon: 'cube', navigationType: 'root' },
            { title: 'Pagos', component: PaymentPage, icon: 'card', navigationType: 'push' },
            { title: 'Historial', component: HistorialPage, icon: 'time', navigationType: 'push' },
            { title: 'Notificaciones', component: NotificationsPage, icon: 'notifications', navigationType: 'push' },
            { title: 'Ayuda', component: HelpPage, icon: 'help-circle', navigationType: 'push' },
            { title: 'Ajustes', component: SettingsPage, icon: 'settings', navigationType: 'push' }
        ];

        // subscribe to authentication state
        this.susbcribeAuthState();     
    }


    /**
     *  FIREBASE AUTH OBSERVER
     */
    private susbcribeAuthState() {
        this.afAuth.authState.subscribe( user => {
            console.info('_authState_');
            if(user) {
                console.log('_authState_', user);
                this.presentLoader('Inicializando cuenta ...');
                setTimeout(() => {
                    this.nav.setRoot(HomePage);
                    this.initAccount();
                }, 2000);

                // this.user = user;
                // this.usersService.reloadUser()
                //     .then((result) => {
                //         //console.log('__ASC__ reloadUser', this.usersService.getUser().uid);
                //         console.log('__ASC__ reloadUser');
                //         return this.verifyAccount();
                //     })
                //     .then((result) => {
                //         console.log('__ASC__ done');
                //     })
                //     .catch(error => console.log('__ASC__ reloadUser > error'));

            } else {
                console.log('__ASC__ NULL');
                this.user = null;
                this.userAccount = null;
            }
        });
    }



    private initAccount() {
        // check if account exist
        this.accountSrv.exist()
            .then(result => {
                console.log('account', result);
                if(!result.getId) {    
                    // no userUid, logout
                    console.log('no id, no exist');
                    this.presentToast('El usuario no es válido, por favor vuelve a ingresar', 2500);                
                    this.authSrv.signOut();                    
                }else if(!result.exist && result.getId){
                    // uid ok, no account yet
                    // set account
                    this.setAccount();
                    // show toaster
                    let toast = this.presentToast('Cuenta aun inicializando ...', 2500);
                }else{
                    // uid ok, account ok
                    this.setAccount();
                    this.nav.setRoot(HomePage);                          
                }   
            })
            .catch(result => {
                console.log('error', result);
                this.presentToast('Ha ocurrido un error en la autenticación, por favor vuelve a ingresar', 2500);                
                this.authSrv.signOut();
            });
    }

    private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe(snap => {
                                console.log('success snap', snap.val());
                                this.account = snap.val();
                                this.checkAccount();
                            }, error => {
                                console.log('error', error);
                                this.presentToast('Ha ocurrido un error recuperando datos de la cuenta, por favor vuelve a ingresar', 2500);                
                                this.authSrv.signOut();                                
                            });
    }
    private unsubscribeAccount() {
        if(this.accountSubs) {
            this.accountSubs.unsubscribe();
        }
    }

    private checkAccount() {
        if(!this.account){
            console.log('checkAccount, account null');
            return;
        }
        // ### IS ACTIVE?
        if(!this.accountSrv.isActive(this.account)) {
            let alertError = this.alertCtrl.create({
                title: 'Cuenta inhabilitada',
                subTitle: 'Lo sentimos, esta cuenta esta desactivada',
                buttons: [{
                    text: 'Cerrar',
                    role: 'cancel',
                    handler: () => {
                        this.signOut();
                    }
                }]
            });
            alertError.present();
        }

        
    }



    /**
     *  VERIFY USER ACCOUNT
     *  1- get user account
     *  2- check account is active
     *  3- check profile.basic is complete 
     *  4- audit email is verified
     */
    private verifyAccount(): Promise<any> {
        console.log('__[0]__ verifyAccount');
        return new Promise((resolve, reject) => {
            console.info('__[1]__ get');
            this.usersService.getAccount()
                .then((snapshot) => {
                    this.userAccount = snapshot.val();
                    return this.checkAccountExistOrDie();
                })
                .then((result) => {
                    console.log('__[1]__', result);
                    if (result) {
                        return this.checkAccountIsActiveOrDie();
                    } else {
                        return false;
                    }
                })
                .then((result) => {
                    console.log('__[2]__', result);
                    if (result) {
                        return this.checkProfileIsCompleteOrGo();
                    } else {
                        return false;
                    }
                })
                .then((result) => {
                    console.log('__[3]__', result);
                    if (result) {
                        this.auditAccountEmailIsVerified();
                    }
                    resolve(true);
                })
                .catch((error) => {
                    console.log('__[0]__', error);
                    reject(error);
                });
        });
    }

    private checkProfileIsCompleteOrGo(): boolean {
        console.info('__[3]__ profileIsComplete');
        let isComplete = this.usersService.accountProfileFieldsIsComplete(this.userAccount, PROFILE_BASIC);
        if (isComplete) {
            return true;
        } else {
            this.nav.setRoot(SignupMergePage);
            return false;
        }
    }

    private checkAccountIsActiveOrDie(): boolean {
        console.info('__[2]__ isActive');
        let accountActive = this.usersService.accountIsActive(this.userAccount);
        if (accountActive) {
            return true;
        } else {
            let alertError = this.alertCtrl.create({
                title: 'Cuenta inactiva',
                subTitle: 'Lo sentimos, esta cuenta esta inactiva, no es posible ingresar',
                buttons: [{
                    text: 'Cerrar',
                    role: 'cancel',
                    handler: () => {
                        this.nav.setRoot(StartPage);
                        setTimeout(() => {
                            this.authSrv.signOut();
                        }, 2000);
                    }
                }]
            });
            alertError.present();
            return false;
        }
    }


    // check userAccount is not null
    // else die
    private checkAccountExistOrDie(): boolean {
        if (this.userAccount) {
            return true;
        } else {
            let alertError = this.alertCtrl.create({
                title: 'Cuenta inválida',
                subTitle: 'Lo sentimos, esta cuenta es inválida, vuelve a registrarte o intenta de nuevo.',
                buttons: [{
                    text: 'Cerrar',
                    role: 'cancel',
                    handler: () => {
                        this.nav.setRoot(StartPage);
                        setTimeout(() => {
                            this.authSrv.signOut();
                        }, 2000);
                    }
                }]
            });
            alertError.present();
            return false;
        }
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
        console.info('__[4]__ auditAccountEmailIsVerified');
        if (this.userAccount.hasOwnProperty('profile') === false) {
            console.error('__[4]__ no-profile', this.userAccount);
        } else {
            console.log('__[4]__ OK');
            //console.log('__[4]__userAccount', this.userAccount);
            let ref = this.usersService.getRef_AccountEmailVerification();
            ref.once('value')
                .then((snapshot) => {
                    //console.log('profile.verification.email.verified == ', snapshot.val());
                    let isVerified: boolean = snapshot.val();
                    if (isVerified === false) {
                        this.usersService.runAuthEmailVerification()
                            .then((result) => {
                                //console.log('checkAuthEmailIsVerified > ', result);                           
                            })
                            .catch((error) => {
                                console.log('__[4]__', error);
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
        if(this.account) {
            // audit if account email is verified
            this.auditAccountEmailIsVerified();
            // navigate to the new page if it is not the current page
            switch (page.navigationType) {
                case 'root':
                    this.nav.setRoot(page.component);
                    break;
                case 'push':
                    this.nav.push(page.component);
                    break;
            }
        }else{
            this.presentToast('La función aun no esta disponible', 2000); 
        }
    }

    goToSettings(): void {
        this.menu.close();
        this.nav.push(SettingsPage);
    }

    /**
     *  HELPERS
     */

    presentToast(msg:string, duration:number = 2000) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: duration
        });
        toast.present();        
        return toast;
    }

    presentLoader(msg: string): void {
        this.loader = this.loadingCtrl.create({
            content: msg,
            dismissOnPageChange: true
        });
        this.loader.present();
    }

    signOut() {
        this.menu.close();
        this.nav.setRoot(StartPage);
        this.unsubscribeAccount();
        this.authSrv.signOut();
    }
}
