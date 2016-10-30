import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
// PAGES
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
import { AccountEmailVerificationService } from '../providers/account-email-verification-service/account-email-verification-service';
import { AccountService } from '../providers/account-service/account-service';
import { AuthenticationService } from '../providers/authentication-service/authentication-service';
import { ProfileService } from '../providers/profile-service/profile-service';
import { SendingService } from  '../providers/sending-service/sending-service';
import { UsersService } from '../providers/users-service/users-service';
import { GoogleMapsService } from '../providers/google-maps-service/google-maps-service';
import { GoogleMapsPlacesService } from '../providers/google-maps-service/google-maps-places-service';
import { GoogleMapsDistanceService } from '../providers/google-maps-service/google-maps-distance-service';
import { GoogleMapsDirectionsService } from '../providers/google-maps-service/google-maps-directions-service';
// PIPES
import { CapitalizePipe } from '../pipes/capitalize-pipe';

@NgModule({
  declarations: [
    MyApp,
    // PAGES
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
    CapitalizePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
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
    AccountEmailVerificationService,
    AccountService,
    AuthenticationService,
    ProfileService,
    SendingService,    
    UsersService,
    GoogleMapsService,
    GoogleMapsPlacesService,
    GoogleMapsDistanceService,
    GoogleMapsDirectionsService
  ],
})
export class AppModule {}
