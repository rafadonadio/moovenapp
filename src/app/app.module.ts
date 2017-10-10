import { APP_CFG } from '../models/app-model';
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
// NATIVE
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LocalNotifications } from "@ionic-native/local-notifications";
// PAGES
import { CheckoutPage } from '../pages/checkout/checkout';
import { HelpPage } from '../pages/help/help';
import { HistorialPage } from '../pages/historial/historial';
import { LoginPage } from '../pages/login/login';
import { ModalAuthResetPasswordPage } from '../pages/modal-auth-reset-password/modal-auth-reset-password';
import { ModalTosPage } from '../pages/modal-tos/modal-tos';
import { ModalUserEditEmailPage } from '../pages/modal-user-edit-email/modal-user-edit-email';
import { ModalUserEditNamePage } from '../pages/modal-user-edit-name/modal-user-edit-name';
import { ModalUserEditPhonePage } from '../pages/modal-user-edit-phone/modal-user-edit-phone';
import { ModalSearchMapAddressPage } from '../pages/modal-search-map-address/modal-search-map-address';
import { SendingsNotificationsPage } from '../pages/sendings-notifications/sendings-notifications';
import { PaymentPage } from '../pages/payment/payment';
import { SendingCreatePage } from '../pages/sending-create/sending-create';
import { SendingCreate2Page } from '../pages/sending-create-2/sending-create-2';
import { SendingCreate3Page } from '../pages/sending-create-3/sending-create-3';
import { SendingCreate4Page } from '../pages/sending-create-4/sending-create-4';
import { SendingActiveDetailPage } from '../pages/sending-active-detail/sending-active-detail';
import { SendingClosedDetailPage } from '../pages/sending-closed-detail/sending-closed-detail';
import { SendingsTabsPage } from '../pages/sendings-tabs/sendings-tabs';
import { SendingsActivePage } from '../pages/sendings-active/sendings-active';
import { SendingsClosedPage } from '../pages/sendings-closed/sendings-closed';
import { SettingsPage } from '../pages/settings/settings';
import { SettingsPopoverPage } from '../pages/settings-popover/settings-popover';
import { ShipmentCreatePage } from '../pages/shipment-create/shipment-create';
import { ShipmentCreate2Page } from '../pages/shipment-create-2/shipment-create-2';
import { ShipmentDetailPage } from '../pages/shipment-detail/shipment-detail';
import { ShipmentsActivePage } from '../pages/shipments-active/shipments-active';
import { ShipmentsClosedPage } from '../pages/shipments-closed/shipments-closed';
import { ShipmentsTabsPage } from '../pages/shipments-tabs/shipments-tabs';
import { ShipmentsNotificationsPage } from '../pages/shipments-notifications/shipments-notifications';
import { SignupPage } from '../pages/signup/signup';
import { SignupMergePage } from '../pages/signup-merge/signup-merge';
import { StartPage } from '../pages/start/start';
import { UpdatePhoneNumberPage } from '../pages/update-phone-number/update-phone-number';
import { VerifyPhonePage } from '../pages/verify-phone/verify-phone';
import { HomePage } from '../pages/home/home';
// PROVIDERS
import { AccountEmailVerificationService } from '../providers/account-email-verification-service/account-email-verification-service';
import { AccountService } from '../providers/account-service/account-service';
import { AuthService } from '../providers/auth-service/auth-service';
import { ConfigService } from '../providers/config-service/config-service';
import { SendingService } from '../providers/sending-service/sending-service';
import { SendingCreateService } from '../providers/sending-service/sending-create-service';
import { SendingNotificationsService } from '../providers/sending-service/sending-notifications-service';
import { SendingPaymentService } from '../providers/sending-service/sending-payment-service';
import { ShipmentsService } from '../providers/shipments-service/shipments-service';
import { NotificationsService } from '../providers/notifications-service/notifications-service';
import { GoogleMapsService } from '../providers/google-maps-service/google-maps-service';
import { DateService } from '../providers/date-service/date-service';
import { HashService } from '../providers/hash-service/hash-service';
import { PriceService } from '../providers/price-service/price-service';
import { MercadopagoService } from '../providers/payment-gateways/mercadopago-service';
import { PaymentService } from '../providers/payment-service/payment-service';
import { CheckoutService } from '../providers/checkout-service/checkout-service';
import { StorageService } from '../providers/storage-service/storage-service';
import { SendingSetGotoperatorService } from '../providers/sending-service/sending-set-gotoperator-service';
import { SendingSetPickedupService } from '../providers/sending-service/sending-set-pickedup-service';
import { SendingSetDroppedService } from '../providers/sending-service/sending-set-dropped-service';
import { SendingSetCanceledbysenderService } from '../providers/sending-service/sending-set-canceledbysender-service';
import { SendingSetCanceledbyoperatorService } from '../providers/sending-service/sending-set-canceledbyoperator-service';

// AngularFire
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database-deprecated';
import { AngularFireAuthModule } from 'angularfire2/auth';

// PIPES
import { CapitalizePipe } from '../pipes/capitalize-pipe';
import { Ts2DatePipe } from '../pipes/ts2date-pipe';
import { FormatDatePipe } from '../pipes/formatdate-pipe';

// IONIC PRO 
import { Pro } from '@ionic/pro';
import { ErrorHandler } from '@angular/core';

const ENV = APP_CFG.CURRENT_ENV;

// IONIC PRO 
// const IonicPro = Pro.init('APP_ID', {
//   appVersion: APP_CFG.ENVIRONMENTS[ENV].IONIC_IO.ID
// });
// export class MyErrorHandler implements ErrorHandler {
//     handleError(err: any): void {
//       IonicPro.monitoring.handleNewError(err);
//     }
// }

// AF2 Settings
export const firebaseConfig = {
    apiKey: APP_CFG.ENVIRONMENTS[ENV].FIREBASE.apiKey,
    authDomain: APP_CFG.ENVIRONMENTS[ENV].FIREBASE.authDomain,
    databaseURL: APP_CFG.ENVIRONMENTS[ENV].FIREBASE.databaseURL,
    storageBucket: APP_CFG.ENVIRONMENTS[ENV].FIREBASE.storageBucket,
    messagingSenderId: APP_CFG.ENVIRONMENTS[ENV].FIREBASE.messagingSenderId
};

@NgModule({
    declarations: [
        MyApp,
        // PAGES
        HomePage,
        CheckoutPage,
        HelpPage,
        HistorialPage,
        LoginPage,
        ModalAuthResetPasswordPage,
        ModalTosPage,
        ModalSearchMapAddressPage,
        ModalUserEditEmailPage,
        ModalUserEditNamePage,
        ModalUserEditPhonePage,
        SendingsNotificationsPage,
        PaymentPage,
        SendingCreatePage,
        SendingCreate2Page,
        SendingCreate3Page,
        SendingCreate4Page,
        SendingActiveDetailPage,
        SendingClosedDetailPage,
        SendingsActivePage,
        SendingsClosedPage,
        SendingsTabsPage,
        SettingsPage,
        SettingsPopoverPage,
        ShipmentCreatePage,
        ShipmentCreate2Page,
        ShipmentDetailPage,
        ShipmentsTabsPage,
        ShipmentsActivePage,
        ShipmentsClosedPage,
        ShipmentsNotificationsPage,
        SignupPage,
        SignupMergePage,
        StartPage,
        UpdatePhoneNumberPage,
        VerifyPhonePage,
        // PIPES
        CapitalizePipe,
        Ts2DatePipe,
        FormatDatePipe
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        HttpModule,
        IonicStorageModule.forRoot({
            name: APP_CFG.ENVIRONMENTS[ENV].LOCALSTORAGE.name,
            driverOrder: ['localstorage', 'indexeddb', 'sqlite', 'websql']
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        CheckoutPage,
        HelpPage,
        HistorialPage,
        LoginPage,
        ModalAuthResetPasswordPage,
        ModalTosPage,
        ModalSearchMapAddressPage,
        ModalUserEditEmailPage,
        ModalUserEditNamePage,
        ModalUserEditPhonePage,
        SendingsNotificationsPage,
        PaymentPage,
        SendingCreatePage,
        SendingCreate2Page,
        SendingCreate3Page,
        SendingCreate4Page,
        SendingActiveDetailPage,
        SendingClosedDetailPage,
        SendingsActivePage,
        SendingsClosedPage,
        SendingsTabsPage,
        SettingsPage,
        SettingsPopoverPage,
        ShipmentCreatePage,
        ShipmentCreate2Page,
        ShipmentDetailPage,
        ShipmentsTabsPage,
        ShipmentsActivePage,
        ShipmentsClosedPage,
        ShipmentsNotificationsPage,
        SignupPage,
        SignupMergePage,
        StartPage,
        UpdatePhoneNumberPage,
        VerifyPhonePage,
        HomePage,
    ],
    providers: [
        // [{ provide: ErrorHandler, useClass: MyErrorHandler }], // Ionic PRO
        Camera,
        SplashScreen,
        StatusBar,
        AccountEmailVerificationService,
        AccountService,
        AuthService,
        ConfigService,
        SendingService,
        SendingNotificationsService,
        SendingCreateService,
        SendingSetGotoperatorService,
        SendingSetPickedupService,
        SendingSetDroppedService,
        SendingSetCanceledbysenderService,
        SendingSetCanceledbyoperatorService,
        ShipmentsService,
        NotificationsService,
        SendingPaymentService,
        GoogleMapsService,
        DateService,
        HashService,
        MercadopagoService,
        PaymentService,
        PriceService,
        CheckoutService,
        StorageService,
        LocalNotifications
    ],
})
export class AppModule { }
