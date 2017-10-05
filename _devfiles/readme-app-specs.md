

## **LOGIC / DATA FLOW**
 
&nbsp;  
&nbsp;  

# **ADMIN APP** 

**Habilitar usuario administrador**  
El usuario debe estar creado.  
{user}/{pass} idem app.  
{key} igual a node userAdmin/{uid}/{key}

            
FIREBASE

    DATABASE
        userAdmin
            uid:{key}

*providers/auth-service/auth-service.ts*
  
&nbsp;  
&nbsp;  

# **APP**  
  
&nbsp;  
&nbsp;  

## **# MENU** > SITEMAP

    [Menu]
        SERVICIOS
            _+ (crear nuevo)
                Nuevo servicio (paso 1)
                    _tomar foto
                    _form_crear (descripcion, tipo, valor)
                    _siguiente
                Nuevo servicio (paso 2)
                    _form_retiro (dirección, horario, contacto)
                    _siguiente
                Nuevo servicio (paso 3)
                    _form_entrega (dirección, horario, contacto)
                    _siguiente
                Nuevo servicio (paso 4)
                    visualización info cargada
                    visualización mapa con trayecto dibujado
                    calculo de precio servicio
                    _confirmar
                        crea servicio
                        _ir a pagar
                            redirige a checkout
                        _volver a servicios
                            opcíón para salir sin pagar
                    _cancelar
                        cancela el servicio cargado (aun no creado)
                        y vuelve a lista servicios

        OPERADOR
        
        PAGOS
        
        HISTORIAL
        
        NOTIFICACIONES
        
        AYUDA
        
        AJUSTES
            _tomar foto
                modifica foto perfil
            _popover
                _Nombre y Apellido
                    modificar 
                _Dirección de email
                    modificar
                _Número de móvil     
                    modificar
            Datos personales
                Validar
                    (boton aparece si email no ha sido validado aun)
            Perfiles
                _actualizar
                    actualiza vista estado perfil
            Avisos
                _toggle notificaciones locales  
                    habilita / deshabilita notificaciones locales
                _toggle email
                    habilita / deshabilita notificaciones via email

       

&nbsp;  
&nbsp;  

---
## **# SECCIONES**

&nbsp;  
>  ### **SIGN-UP**
> ### **Crear Usuario** > Paso 1
> Form para crear usuario  
> Datos de registro:
>  - email 
>  - contraseña  
> &nbsp;

&nbsp;

*pages/signup/signup.ts*  

   
    submit()  
        form.invalid  
            showError
        form.valid  
            createUser() 
                usersSrv.createUser()
                    crear usuario con Firebase Auth
                usersSrv.createAccountStep1()  
                    accountSrv.createStep1() [DB_WRITE]
                        escribe nueva cuenta en Db 
                        /userAccount/

                    ** AuthChange **
                        (app/app.component.ts)
                        auth.subscribe() detecta cambios
                        y redirige automaticamente a "Step 2" 
                        para permitir completar datos personales

                    ** CF_Trigger **
                        (ver Cloud Functions)
                        user.onCreate()
                            dispara cloud function: setUserVerifyEmail
                            envia email de validación de correo electronico ingresado
            
FIREBASE

    AUTH
        create user

    DATABASE
        userAccount
            uid
               [user account node]
   
    CLOUD FUNCTIONS
        functions.auth.user().onCreate()
            setUserVerifyEmail()

&nbsp; 

--- 
> ### **SIGN-UP**
> ### **Crear Usuario** > Paso 2
> Este paso es forzado a completarse, si el usuario sale antes de completar, al loguerse nuevamente se redirige a esta pantalla.
> Solo puede salir de esta pantalla completando los datos requeridos.
>   
> Form para datos adicionales del usuario:    
>  - nombre  
>  - apellido  
>  - telefono  
>  - foto perfil (opcional)
>  - ver y aceptar TOS   
> &nbsp;

&nbsp;

*pages/signup-merge/signup-merge.ts*

    uploadPicture()
        getPicture()
            toma foto con camara de movil
        uploadProfileImage()
            guarda foto en storage 
        updateAccountImage()
            actualiza perfil
    submit()
        form.invalid || !TOS_accepted
            showError
        form.valid 

&nbsp; 

---
> ### **AJUSTES**  
> Pagina de ajuste y visualización de datos del usuario.  
> Visualizar:  
>   - nombre y apellido
>   - dirección de email
>   - número de móvil
>   - Perfiles
>       - registro (estado del alta como usuario)  
>       - servicio (estado del alta como solicitante de servicio)
>       - operador (estado del alta como operador)  
> &nbsp;  
>
> Acciones:  
> - foto de perfil
> - nombre y apellido
> - dirección de email  
> - número de movil
> - reenviar email de validacion
>   - (si aun no ha sido validado)
> - actualizar vista
>   - boton actualizar
>   - deslizar hacia abajo 
> Avisos
> - notifaciones vía email
> - notificaciones locales  
> &nbsp;

&nbsp;  

*pages/settings/settings.ts*

    doRefresh()
        actualiza datos de la vista
    updateUserProfileStatus()
        actualiza estado de perfiles
    updateNotificationSettings()
        actualiza estado de las notificaciones
    updatePicture()
        modifica imagen perfil
    reverifyEmail()
        confirmReverifyEmail()
            resendEmailVerification()
                crea registro en DB para disparar CF
                
                ** CF_Trigger **
                (ver Cloud Functions)
                database.onWrite()
                    dispara cloud function: resendUserVerifyEmail
                        envia email de validación de correo electronico ingresado
    signOut()
        desloguearse

&nbsp; 

---
> ## **SERVICIOS**
> &nbsp;  

&nbsp; 

> ### **Nuevo Servicio** > Paso 1/4
> Paso 1 de alta de servicio  
> form:  
> - foto (opcional)
> - Descripción corta
> - Tipo de objeto
> - Valor a declarar  
> &nbsp;  

&nbsp;  

*pages/sending-create/sending-create.ts*

    ngOnInit()
        initSending
            inicializa sending

    populateForm()
        si es una re-visita, hay datos en parametro
        se rellena form con datos ya ingresados

    takePicture()
        guarda foto tomada con movil
        guarda foto en formato base64

    cancelSending()
        anular todo y salir a sendings

    resetObjectDeclaredValue()
        observer de toggle para "sin valor"
            para toggle=si
                rango de valores deshabilitado
                rango de valores a zero

    submit()
        form.invalid
            showError
        form.valid
            showPictureAlert()
                si no hay foto cargada, alertar
            processForm()
                saveSending()
                    guarda valores en app (sending), no db
                goToNextStep()
                    redirige a paso 2
                    envia datos guardados en parametro   

&nbsp; 

--- 
> ### **Nuevo Servicio** > Paso 2/4
> Paso 2 de alta de servicio  
> form:  
> - dirección de retiro
> - banda horaria de Retiro
> - contacto para retiro  
>  &nbsp; 

*pages/sending-create/sending-create.ts*

    ngOnInit()
        setUser()
            trae datos de usuario
        initPlaceDetails()
        iniMap()
            inicializa google maps
        initForm()
            inicializa form
        getSendingFromParams()
        populatePage()
            rellena datos de form
    
    (Date action flow)
        init
            pickupDate empty?
                yes
                    resetDateTimeFromTo()
                no
                    is TimeFrom older than now?
                        yes
                            resetDateTimeFromTo()
                        no
                            set form values
        edit
            Date
                limits (from today to today+5)
                (click)
                    update DateLimits when Date clicked
                (ionChange)
                    update timeLimits()
                    validate Date
                    validate TimeFrom
                    validate TimeTo

    submit()
        form.invalid
            showError
        form.valid
            update()
                guarda datos en app
            gotoNextStep()
   
&nbsp;    

---
> ### **Nuevo Servicio** > Paso 3/4
> Paso 3 de alta de servicio  
> form: Datos de la Entrega  
> - dirección de entrega
> - banda horaria de Entrega
> - contacto para entrega  
>   &nbsp;  

*pages/sending-create-3/sending-create-3.ts*

    ngOnInit()
        setUser()
            trae datos de usuario
        initPlaceDetails()
        iniMap()
            inicializa google maps
        initForm()
            inicializa form
        getSendingFromParams()
        populatePage()
            rellena datos de form  

    submit()
        form.invalid
            showError
        form.valid
            update()
                guarda datos en app
            gotoNextStep()

&nbsp; 

---
> ### **Nuevo Servicio** > Paso 4/4 
> Paso 4 de alta de servicio  
> form: Confirmar Datos  
> - visualización completa de servicio cargado
> - visualización de trayecto dibujado en mapa
> - calculo de precio del servicio
> - confirmar crear servicio
> - redirigir a Pagar (Checkout)  
>  &nbsp;

&nbsp;

*pages/sending-create-4/sending-create-4.ts*

    ngOnInit()
        getSendingFromParams()
        initMap()
            inicializa mapa
        initRouteDetails()
        getRoute()
            inicializa mapa
            obtiene datos de trayecto
            dibuja trayecto sugerido en mapa
            setPrice()
                establece precio en función de distancia aproximada

    runCreate()
        create()
            opc:confirmar
                createSending()
                    sendingSrv.register()
                        getSummary()
                            setea datos de resumen para "estado actual"               
                        dbSrv.newSending() [DB_WRITE]
                            escribe en DB
                                /sendings/
                                /sendingsByPublicid/
                                /_sendingsCreated/
                                /userSendings/
                        logNotifications()
                        uploadSendingImage()
                            updateSendingImage()
                        runPayment()
                            alert()
                                opc:pagar
                                    goToCheckout()


FIREBASE

    DATABASE

        sendings
            {uid}
                [sending node]
            sendingsByPublicid
                {publicId}
                    {sendingId}
            _sendingsCreated
                {sendingId}
                    [summary node]
            userSendings
                {userId}
                    {stage}
                        {sendingId}
                            [summary node]

    CLOUD FUNCTIONS



&nbsp;  

---
> ### **CHECKOUT**
> 
> ingresar datos de tarjeta de crédito 
> se crea pago con Mercadopago
> - si hubiese un error, se devuelve con mensaje en alerta  
> &nbsp;  

&nbsp;  

*pages/checkout/checkout.ts*

    ngOnInit()
        setUser()
            setea user data
        setCurrentDates()
            setea fechas para usar con pago (vencimiento tarj)
                current
                    fecha actual
                currentplus20
                    hoy+20años
        setDefaultDates()
            setea fecha por defecto para vencimiento tarjeta (mes/año actual)
        setSending()
            setea sending con dato en param
        initForm()
            inicializa form
        setGenericCreditCardImage()
            setea imagen x defecto tarj
   
    guessPaymentMethod()
        valida nro de tarjeta ingresado con API y resuelve emisor
    
    runCheckout()
        showPayLoader()
        isFormValid()
                valida campos completos form 
                (cardNumber, securityCode, cardExpiration, 
                cardHolderName, docNumber, docType, paymentMethodId)
            setTokenData() 
                setear datos para solicitar token
            createCardToken()
                crear card token (MP API)
            validateCardTokenAndPay()
                    se que se haya generado el token de MP con el sdk
                hasTokenCardResponseError()
                    true
                        showCreateCardTokenResponseError()
                            display errores al generar token (CardToken API)
                            errores en datos cargados en el form de pago
                            (ej: num de tark, fecha venc, nombre, etc)
                    false
                        createPayment()
                                crear pago
                            getPrepaymentData()
                                setear datos para crear pago y enviar a CF
                            paySrv.checkoutMP()
                                    hacer pago (envia solicitud a CF) 

                                    ** CF_Trigger **
                                    (ver Cloud Functions)
                                    http.request > paymentGatewayMP.create()

                                processPaymentResponse()
                                    clearSessionMP()
                                            hack por si hay que repetir pago en caso de error
                                        getPaymentResultState()
                                            mensaje humanizado de resultado de pago
                                        showCheckoutAlert()
                                            mostrar mensaje y cerrar pagina

                                ** CF_Trigger **
                                (ver Cloud Functions)
                                database.onWrite()                                     
                                    asigna registro de pago a servicio
                                        cambia estado de registered a paid
                                        cambia estado de paid a enabled
                                        cambia estado de enabled a waitoperator


FIREBASE

    DATABASE

        /payments/
            {paymentId}
                [paymentData node]

        /sendings/
            {sendingId}
                _payment
                    {paymentId}
                        [sendingPaymentData]


&nbsp;  
&nbsp;  
&nbsp;  
&nbsp; 

---
## **# CLOUD FUNCTIONS**
### Firebase Cloud Functions (CF)

&nbsp;    

> ### **Validar Email** 
> ### Trigger: On User Create 
> **Enviar email para verificar dirección de correo del usuario**   
> Envía email de verificación
> - se crea usuario con firebase.auth()
> - CF dispara ejecución de exports.setUserVerifyEmail
>   - crea y escribe token en DB  
>       /userVerifyEmailTokens/  
>       /userVerifyEmailTokensByUser/  
>   - envía email en español a user.email con link de validación   
> &nbsp;

&nbsp;

*functions/index.js*

    setUserVerifyEmail() 

*functions/services/user-email-validation.js*

    set()
        writeTokenData()
                escribe en db
            sendEmail()
                envia email con link
   
FIREBASE

    DATABASE
        userVerifyEmailTokens
            {tokenId}
                email
                expire
                token
                uid
                used
   
        userVerifyEmailTokens
            {userId}
                {tokenId}
                    timestamp
                    token
                    uid

&nbsp;  
&nbsp; 
&nbsp;  
&nbsp;  

---
## **# SERVICIO: ETAPAS Y ESTADOS**

**STAGES**  | **STATES** | Detalle
----------- | ---------- | -------
CREATED | &nbsp; | Creado
 &nbsp; | registered | ha sido registrado correctamente. 
 &nbsp; | paid | el pago ha sido intentado, en proceso de confirmarse.  
 &nbsp; | enabled | el pago ha sido confirmado, el servicio queda habilitado para operar en Mooven.
LIVE | &nbsp; | En vivo 
 &nbsp; | waitoperator | el servicio esta disponible para ser tomado por un operador.   
 &nbsp; | gotoperator | el servicio ha sido tomado por un operador.
 &nbsp; | waitpickup | el servicio esta en espera de ser retirado por el operador asignado. 
 &nbsp; | pickedup | el servicio ha sido retirado por el operador.  
 &nbsp; | inroute | el servicio esta en ruta hacia el destino.
 &nbsp; | dropped | el servicio ha sido entregado en destino.
CLOSED | &nbsp; | Cerrado
 &nbsp; | payexpired | el servicio ha sido completado satisfactoriamente.
 &nbsp; | completed | el servicio ha sido completado satisfactoriamente.
 &nbsp; | canceledbysender | el servicio ha sido cancelado por el solicitante.
 &nbsp; | canceledbyoperator | el servicio ha sido cancelado por el operador.
 &nbsp; | gotoperatorexpired | el servicio ha expirado antes de ser tomado por un operador.

&nbsp;  
&nbsp;  

> ### **Display de estado**
> Etapa/estado combinado visualizado mediante icono en pantalla "Servicios".  
> &nbsp;  

**DISPLAY COMBINADO**  | Stage  | Status        | Icono | Texto
---------------------- | ------ | ------------- | ----- | -----
created_registered  | CREATED   | registered    | time  | boton PAGAR
created_paid        | CREATED   | paid          | card | Verificando pago
created_enabled     | CREATED   | enabled       | send | Aguardar Operador
live_waitoperator   | LIVE      | waitoperator  | send | Aguardar Operador
live_gotoperator    | LIVE      | gotoperator   | home | Aguardar Retiro
live_waitpickup     | LIVE      | waitpickup    | home | Aguardar Retiro
live_pickedup       | LIVE      | pickedup      | pin | En transito
live_inroute        | LIVE      | inroute       | pin | En transito
live_dropped        | LIVE      | dropped       | checkmark-circle | Entregado 
closed_completed    | CLOSED    | completed     | checkmark-circle | Entregado
closed_autocompleted  | CLOSED    | autocompleted     | checkbox | Entregado
closed_canceledbysender | CLOSED | canceledbysender | alert | --
closed_canceledbyoperator | CLOSED | canceledbyoperator | alert | -- 
closed_payexpired   | CLOSED | closedpayexpired | alert | -- 
closed_gotoperatorexpired   | CLOSED | gotoperatorexpired | alert | -- 

&nbsp;  
&nbsp; 
&nbsp;  
&nbsp;  

---
## **# SERVICIO: LIFE CYCLE**

![life-cycle](service-lifecycle.png)

&nbsp;  
&nbsp; 
&nbsp;  
&nbsp;  

---
## **# DATABASE: TREE**

> userAccount

        userAccount
            {uid} 
                ToS
                    accepted
                    acceptedTimestamp
                    acceptedVersionId
                    acceptedVersionTag
                    history
                        {uid}
                            timestamp
                            versionId
                active
                createdAt
                deletedAt
                profile
                    data
                        dateBirth
                        email
                        emailOnChange
                        firstName
                        lastName
                        legalIdentityNumber
                        phoneMobile
                        phonePrefix
                        photoPath
                        photoURL
                        residenceAddress
                        residenceAddressL2
                        residenceCity
                        residenceCountry
                    status
                        basic
                            fieldsComplete
                            VerificationsComplete
                        operator
                            fieldsComplete
                            VerificationsComplete
                        sender
                            fieldsComplete
                            VerificationsComplete
                    verifications
                        email
                            verified
                            verifiedAddress
                            verifiedTimestamp
                        legalIdentity
                            imageURL
                            verified
                            verifiedBy
                            verifiedNumber
                            verifiedTimestamp
                        phone
                            verified
                            verifiedNumber
                            verifiedTimestamp
                        residenceAddress
                            imageUrl
                            verified
                            verifiedAddress
                            verifiedBy
                            verifiedTimestamp
                providerId
                settings
                    notifications
                        email
                        localPush

&nbsp;
> userVerifyEmailAttemptsByTokens

    userVerifyEmailAttemptsByTokens
        {tokenId}
            timestamp
            token
            validToken
            verified

&nbsp;
> userVerifyEmailResend

    userVerifyEmailResend
        {uid}
            timestamp
            userId

&nbsp;
> userVerifyEmailTokens

    userVerifyEmailTokens
        {tokenId}
            email
            expire
            token
            uid     (userId)
            used

&nbsp;
> userVerifyEmailTokensByUser

    userVerifyEmailTokensByUser
        {userId}
            {tokenId}
                timestamp
                token
                uid     (userId)






TEMPLATE
---

### lorem ipsum 
> lorem ipsum  
> -  lorem ipsum 

*pages/yiytit/yorytort.ts*

    ngOnInit()      
   
---




### EMAIL ACCOUNTS
        
    no-reply@moovenapp.com / U%&AUQ7#7_Q2

        Username:	no-reply@moovenapp.com
        Password:	Use the email account’s password.
        Incoming Server:	moovenapp.com
        IMAP Port: 993 POP3 Port: 995
        Outgoing Server:	moovenapp.com
        SMTP Port: 465
        IMAP, POP3, and SMTP require authentication.  