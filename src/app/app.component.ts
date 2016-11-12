import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { UsersService } from '../providers/users-service/users-service';
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

declare var google: any;
declare var window: any;

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
    loader: any;
    currentUser;
    currentUserAccount;                

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
            { title: 'Envíos', component: SendingsPage, icon: 'send', navigationType: 'root' },
            { title: 'Cargas', component: ShipmentsPage, icon: 'cube', navigationType: 'root' },
            { title: 'Pagos', component: PaymentPage, icon: 'card', navigationType: 'push' },
            { title: 'Historial', component: HistorialPage, icon: 'time', navigationType: 'push' },
            { title: 'Notificaciones', component: NotificationsPage, icon: 'notifications', navigationType: 'push' },
            { title: 'Ayuda', component: HelpPage, icon: 'help-circle', navigationType: 'push' }
        ];

        // observer for firebase auth
        af.auth.subscribe( user => {
            if (user) {
                console.log('app > authStateChanged > user signed in > user uid', user.uid);
                this.currentUser = user.auth;
                this.setCurrentUserAccount()
                    .then((account) => {
                        if(account === null) {
                            console.error('app > setCurrentUserAccount > NULL ');
                            this.currentUserAccount = false;
                        }else{
                            console.log('app > setCurrentUserAccount > success > ', account);
                            this.currentUserAccount = account;
                        }
                        // check if user state is OK
                        this.checkAccountStatusAndGo();                                                
                    });

                this.nav.setRoot(SendingsPage);
            } else {
                // If there's no user logged in send him to the StartPage
                console.log('app > authStateChanged > no user signed in, user > ', user);
                this.nav.setRoot(StartPage);
            }
        });        

    }

    openPage(page): void {
        // close the menu when clicking a link from the menu
        this.menu.close();

        // user validations check
        // before going to requested page, lets check if validations are true
        this.checkAccountEmailIsVerifiedOrGo();

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

    goToDefaultPage():void {
        this.rootPage = SendingsPage;
    }

    checkAccountStatusAndGo():void {
        console.info('app > checkAccountStatusAndGo');
        this.presentLoader('app > checkAccountStatusAndGo > verificando credenciales ...');
        this.usersService.getCurrentUserAccount()
            .then((snapshot) => {
                let account:any;
                if(snapshot.val() === null) {
                    account = null;
                    console.error('app > checkAccountStatusAndGo > account data NULL');
                }else{
                    account = snapshot.val();
                    console.log('app > checkAccountStatusAndGo > account data ok');
                }    
                // close loader and do some background checks
                this.loader.dismiss()
                    .then(() => {
                        // check account is active
                        this.userAccountIsActiveOrDie(account);
                    })
                    .then(() => {
                        // check profile is complete
                        this.checkAccountProfileIsCompleteOrGo(account, 'basic');
                    });
            })
            .catch((error) => {
                this.loader.dismiss();
                console.log('app > checkAccountStatusAndGo > error ', error);
            });
    }

    /**
     * USER ACCOUNT HELPER
     */
    setCurrentUserAccount():Promise<any> {
        return new Promise((resolve, reject) => {
            this.usersService.getCurrentUserAccount()
                .then((snapshot) => {
                    console.log('setCurrentUserAccount > snapshot > ok ');
                    resolve(snapshot.val());
                })
                .catch((error) => {
                    console.log('app > setCurrentUserAccount > failed', error);
                });
        });
           
    }

    userAccountIsActiveOrDie(account: any){
        if(this.usersService.isAccountActive(account)===false) {
            // account is inactive, show error and signout
            console.log('app > userAccountIsActiveOrDie > is active > FALSE');
            this.presentAlertAndAction('Cuenta inactiva',
                'Lo sentimos, esta cuenta esta inactiva, no es posible ingresar',
                'signout'
                );
        }else{
            console.log('app > userAccountIsActiveOrDie > is active > ok');
        }
    }

    checkAccountProfileIsCompleteOrGo(account: any, profileType: string): void {
        if(this.usersService.isProfileComplete(account, profileType)===false) {
            console.log('app > checkAccountProfileIsCompleteOrGo > is incomplete > FALSE');
            this.nav.setRoot(SignupMergePage);
        }
        else{
            console.log('app > checkAccountProfileIsCompleteOrGo > is incomplete > ok');
        }
    }
    
    /**
     * Check email verification in 3 steps
     * 1- check value in account (instant)
     * 2- if false, check firebase user if already verified (promise)
     * 3- update account value to whatever is
     */
    checkAccountEmailIsVerifiedOrGo(): void {
        var self = this;
        //is account defined?
        if(typeof this.currentUserAccount === 'undefined') {
            console.log('app > checkAccountEmailIsVerifiedOrGo > error > currentUserAccount not defined yet');
        }else{
            console.log('app > checkAccountEmailIsVerifiedOrGo > error > currentUserAccount ok');
            // is account.emailVerified value true?
            console.log('app > checkAccountEmailIsVerifiedOrGo > emailVerifiedRef retrieving ...');
            // get firebase database Ref
            var emailVerifiedRef = this.usersService.getAccountEmailVerifiedRef();
            // retrieve value event
            emailVerifiedRef.on('value', function(snapshot) {
                console.log('app > checkAccountEmailIsVerifiedOrGo > emailVerifiedRef value > ', snapshot.val());
                var isVerified: boolean = snapshot.val();
                console.log('app > checkAccountEmailIsVerifiedOrGo > account email is verified > ', isVerified);
                // if false, check fb user value if already verified, then run updates
                if(isVerified === false) {
                    console.log('app > checkAccountEmailIsVerifiedOrGo > run email verification ..');
                    // check fbuser if emailVerified is true and update account
                    self.usersService.runUserEmailVerificationCheck()
                        .then((result) => {
                            console.log('app > checkAccountEmailIsVerifiedOrGo > email verification check > ', result);
                            // set account again
                            self.setCurrentUserAccount();
                        })
                        .catch((error) => {
                            console.log('app > checkAccountEmailIsVerifiedOrGo > email verification check failed > ', error);
                        });
                }
            });
        }
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

    presentAlertAndAction(title: string,
        subtitle: string,
        action: string): void {
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
