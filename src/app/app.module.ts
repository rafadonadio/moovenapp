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
import { NotificationsPage } from '../pages/notifications/notifications';
import { PaymentPage } from '../pages/payment/payment';
import { SendingCreatePage } from '../pages/sending-create/sending-create';
import { SendingCreate2Page } from '../pages/sending-create-2/sending-create-2';
import { SendingCreate3Page } from '../pages/sending-create-3/sending-create-3';
import { SendingCreate4Page } from '../pages/sending-create-4/sending-create-4';
import { SendingDetailPage } from '../pages/sending-detail/sending-detail';
import { SendingsPage } from '../pages/sendings/sendings';
import { SettingsPage } from '../pages/settings/settings';
import { SettingsPopoverPage } from '../pages/settings-popover/settings-popover';
import { ShipmentCreatePage } from '../pages/shipment-create/shipment-create';
import { ShipmentCreate2Page } from '../pages/shipment-create-2/shipment-create-2';
import { ShipmentDetailPage } from '../pages/shipment-detail/shipment-detail';
import { ShipmentsPage } from '../pages/shipments/shipments';
import { SignupPage } from '../pages/signup/signup';
import { SignupMergePage } from '../pages/signup-merge/signup-merge';
import { StartPage } from '../pages/start/start';
import { UpdatePhoneNumberPage } from '../pages/update-phone-number/update-phone-number';
import { VerifyPhonePage } from '../pages/verify-phone/verify-phone';
// PROVIDERS
import { AccountEmailVerificationService } from '../providers/users-service/account-email-verification-service';
import { AccountService } from '../providers/users-service/account-service';
import { AccountProfileService } from '../providers/users-service/account-profile-service';
import { AccountSettingsService } from '../providers/users-service/account-settings-service';
import { AuthenticationService } from '../providers/users-service/authentication-service';
import { SendingService } from '../providers/sending-service/sending-service';
import { SendingCreateService } from '../providers/sending-service/sending-create-service';
import { SendingDbService } from '../providers/sending-service/sending-db-service';
import { SendingNotificationsService } from '../providers/sending-service/sending-notifications-service';
import { SendingRequestService } from '../providers/sending-service/sending-request-service';
import { SendingPaymentService } from '../providers/sending-service/sending-payment-service';
import { ShipmentsService } from '../providers/shipments-service/shipments-service';
import { ShipmentsDbService } from '../providers/shipments-service/shipments-db-service';
import { NotificationsService } from '../providers/notifications-service/notifications-service';
import { UsersService } from '../providers/users-service/users-service';
import { GoogleMapsService } from '../providers/google-maps-service/google-maps-service';
import { DateService } from '../providers/date-service/date-service';
import { HashService } from '../providers/hash-service/hash-service';
import { PriceService } from '../providers/price-service/price-service';
import { MercadopagoService } from '../providers/payment-gateways/mercadopago-service';
import { CheckoutService } from '../providers/checkout-service/checkout-service';
import { StorageService } from '../providers/storage-service/storage-service';
import { SendingSetGotoperatorService } from '../providers/sending-service/sending-set-gotoperator-service';
import { SendingSetPickedupService } from '../providers/sending-service/sending-set-pickedup-service';
import { SendingSetDroppedService } from '../providers/sending-service/sending-set-dropped-service';

// AngularFire
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

// PIPES
import { CapitalizePipe } from '../pipes/capitalize-pipe';
import { Ts2DatePipe } from '../pipes/ts2date-pipe';
import { FormatDatePipe } from '../pipes/formatdate-pipe';
// IONIC.IO
// import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

const ENV = APP_CFG.CURRENT_ENV;
// const cloudSettings: CloudSettings = {
//     'core': {
//         'app_id': APP_CFG.ENVIRONMENTS[ENV].IONIC_IO.ID
//     }
// };

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
        NotificationsPage,
        PaymentPage,
        SendingCreatePage,
        SendingCreate2Page,
        SendingCreate3Page,
        SendingCreate4Page,
        SendingDetailPage,
        SendingsPage,
        SettingsPage,
        SettingsPopoverPage,
        ShipmentCreatePage,
        ShipmentCreate2Page,
        ShipmentDetailPage,
        ShipmentsPage,
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
        // CloudModule.forRoot(cloudSettings),
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
        NotificationsPage,
        PaymentPage,
        SendingCreatePage,
        SendingCreate2Page,
        SendingCreate3Page,
        SendingCreate4Page,
        SendingDetailPage,
        SendingsPage,
        SettingsPage,
        SettingsPopoverPage,
        ShipmentCreatePage,
        ShipmentCreate2Page,
        ShipmentDetailPage,
        ShipmentsPage,
        SignupPage,
        SignupMergePage,
        StartPage,
        UpdatePhoneNumberPage,
        VerifyPhonePage,
    ],
    providers: [
        Camera,
        SplashScreen,
        StatusBar,
        AccountEmailVerificationService,
        AccountService,
        AccountProfileService,
        AccountSettingsService,
        AuthenticationService,
        SendingService,
        SendingDbService,
        SendingNotificationsService,
        SendingRequestService,
        SendingCreateService,
        SendingSetGotoperatorService,
        SendingSetPickedupService,
        SendingSetDroppedService,
        ShipmentsService,
        ShipmentsDbService,
        NotificationsService,
        SendingPaymentService,
        UsersService,
        GoogleMapsService,
        DateService,
        HashService,
        MercadopagoService,
        PriceService,
        CheckoutService,
        StorageService,
    ],
})
export class AppModule { }
