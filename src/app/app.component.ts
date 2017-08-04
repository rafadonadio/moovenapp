import { Subscription } from 'rxjs/Rx';
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
import { UserAccount } from '../models/user-model';
import firebase from 'firebase';

declare var window: any;


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
    

    constructor(public platform: Platform,
        private statusBar: StatusBar,
        private splashScreen: SplashScreen,
        public menu: MenuController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
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

    // VIEW ACTIONS

    openPage(page:any) {
        this.runOpenPage(page);
    }

    signOut() {
        this.runSignOut();
    }


    /**
     *  PRIVATE
     */

    //FIREBASE AUTH OBSERVER
    private susbcribeAuthState() {
        this.authSrv.firebaseAuthObservable()
            .subscribe( user => {
                console.info('_authState_');
                if(user) {
                    // user OK
                    console.log('_authState_', user);
                    this.user = user;
                    this.presentLoader('Inicializando cuenta ...');
                    setTimeout(() => {
                        this.nav.setRoot(HomePage);
                        this.initAccount();
                    }, 2000);
                } else {
                    // user is null, bye
                    console.log('__ASC__ NULL');
                    this.signOut();
                }
            });
    }

    // check if userAccount exists
    // userAccount is created by CF trigger:user.onCreated
    // if account not yet exist, it keeps user in homepage
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

    // account exists, so set for current main component
    // account data stays alive in realtime
    // if account wasn´t yet created, it will change state when it is
    private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe(snap => {
                                // console.log('success snap', snap.val());
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

    // account is set
    // check account health in realtime:
    // * 1 - check is active
    // * 2 - check profile.basic is complete 
    // * 3 - audit email is verified
    private checkAccount() {
        if(!this.account){
            console.log('checkAccount, account null');
            return;
        }
        // ### IS ACTIVE?
        if(!this.accountSrv.isActive(this.account)) {
            console.log('checkAccount _1_, active false');
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
        // IS BASIC PROFILE COMPLETE
        }else if(!this.accountSrv.isBasicProfileComplete(this.account)){
            console.log('checkAccount _2_, basic profile incomplete');
            this.goToAccountConfirmPage();    
        }
        
    }

    // go to merge page to complete profile data
    private goToAccountConfirmPage() {
        this.nav.setRoot(SignupMergePage);
    }

    /**
     *  NAVIGATION
     */

    runOpenPage(page): void {
        // close the menu when clicking a link from the menu
        this.menu.close();
        if(this.account) {
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

    pushSettings() {
        this.menu.close();
        this.nav.push(SettingsPage);
    }

    /**
     *  HELPERS
     */

    private presentToast(msg:string, duration:number = 2000) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: duration
        });
        toast.present();        
        return toast;
    }

    private presentLoader(msg: string): void {
        this.loader = this.loadingCtrl.create({
            content: msg,
            dismissOnPageChange: true
        });
        this.loader.present();
    }

    private runSignOut() {
        this.menu.close();
        this.nav.setRoot(StartPage);
        this.unsubscribeAccount();
        this.authSrv.signOut();
        this.user = null;
        this.account = null;
    }
}
