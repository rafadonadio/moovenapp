
### BUILD FOR WEB
```bash
npm run ionic:build --prod
```

    In many cases, new features and bug fixes are available only with the latest version of the Firebase CLI and firebase-functions SDK. It's a good practice to frequently update both the Firebase CLI and the SDK with these commands inside the functions folder of your Firebase project:

    npm install firebase-functions@latest --save
    npm install -g firebase-tools


#############
# TO_DO
#############

# CLOSE (corte)

- app
    <!-- - refactor sending (switch to authService AccountService) -->
    - cf de cancelación
        <!-- app: cancelar servicio (usuario) *closed_canceledbysender* -->
        <!-- app: cancelar servicio (operador) *closed_canceledbyoperator* -->
        <!-- cron: cancelar servicio no pagado *closed_payexpired* -->
        <!-- cron: cancelar servicio no tomado *closed_waitoperatorexpired* -->
        <!-- cron: cerrar servicio con hora de entrega pasada y notificaciones no enviadas *closed_autocompleted* -->
    <!-- - set shipment notifications -->
    - ajuste visualización items en tab sending, a vencer en menos de 30 minutos - sending
    - ajuste visualización items en tab history - sending
    - ajuste visualización items en tab history - shipment
    - visualización pedidos en mapa - shipment new
    - notificaciones (email)
    - network detector
    - operatorWallet 
    - BUG: 
        - al cambiar horario pickup 12, 12.30 no suma 2 hs a drop
        - permitir tomarlo desde YA

    - ** notificaciones (push)
    - ** replicate datastore
    - ** log (big query)
    - ** cron para listar servicios (pagados) a vencer en 30 minutos

- admin
    - contadores
        servicios por stage, status
        servicios por fecha
        usuarios
        operadores
    - dashboard
        - mostrar contadores
    - mercado pago
        habilitar HTTP trigger: Notifications IPN, para sync de pagos con MP

# MOOVEN APP
- Nuevo Servicio - Paso 2    
    <!--- ingresar fecha  -->
    <!--- validar horario-->
        <!--validar fecha (hasta 5 días en reserva)-->
        <!--validar drop time si pickup cambio-->
        <!--validar pickup si drop cambio-->
        <!--validar pickup/drop si hora cambió-->
- Nuevo Servicio - Paso 3  
    <!--- validar horario        -->
- Nuevo Servicio - Paso 4  
    <!--- calculo precio-->
    establecer comision operador 30%
- Service actions
    - cancel before paying
- Nuevo shipment
     - impedir user tomar propio servicio
     - en vista tomar servicio, listar vacantes en función de center-map + limite mapa, reaccionar a cuando el mapa se mueve y actualizar listado de vacantes.    
- Checkout
    - crear usuario MP
    - guardar datos tarjeta en MP
- Operator
    <!-- set role
    define role data
    refactor data used on shipment -->
- Notificaciones
    notificaciones via email
    local notifications
- Historial
    - historial de servicios
- Pagos
    - historial de pagos realizados
- Ayuda
    ....
- Varios  
    - registrar cada acción de usuario  
    - obtener datos marca/modelo del dispositivo del usuario (???)
    - funcionalidad para cerra cuenta de usuario
    - firebase network detector
    <!-- - email para recuperar contraseña, hacer custom español -->
- Ajustes  
    - boton para cerrar aplicación
    - notificaciones (locales/email) - revisar
     - limitar intentos de reenviar email de validación 

# ADMIN APP
- init
    <!-- nueva ionic app -->
- operadores
    <!-- crear operadores  -->
    al crear: indicar datos faltantes que no permiten activar.a
    consulta de servicios realizados, monto total de ingresos.

# CF
- mercado pago
    habilitar HTTP trigger: Notifications IPN, para sync de pagos con MP
- test data in google gloud datastore
- test data in google gloud bigquery



#---------------
# TO BE DEFINED 
#---------------
- fecha de servicio
    - que pasa con feriados?
    - que pasa con fin de semana?
- situaciónes de conflicto a preveer:
    - operador dice que lo entrega
    - usuario dice que no lo recibió
    - solución: ???
    

# BIG_QUERY
    Set the bigquery.datasetName and bigquery.tableName 
    Google Cloud environment variables to match the Dataset name and the Table name 
    where you want the logs written to. 
        $ firebase functions:config:set bigquery.datasetmoovendev="moovendev" bigquery.tabletasks="tasks"


# CHANGELOG


#### 06/2017

**0.8.5**

- migrating to Cloud Functions > set gotoperator
- migrating to Cloud Functions > set pickedup
- migrating to Cloud Functions > set dropped
- migrating to Cloud Functions > set complete
- clean up unused functions
- UPDATE > firebase 4.x / angularfire RCx
- update ionic Native plugins > 3.x
- update ionic Native plugins > Camera
- refactor camera plugin component
- limit time selection to current or later
- limit drop time selection equal or greater than pickup time
- allow set pickup time on schedule
- adjust all date displays format
- fix bug: address modal opens twice
- update Mercadopago App ID and token



#### 05/2017

**0.8.1**

- bug/fixes
- document data-flow
- update ionic 3.2.0
- update app-scripts 1.3.7
- refactor
    sending create
- price calculator
- checkout refactor
- manually resend email verification
- cloud functions
    move function from app to cloud
- refactor
    migrate paid assignation and stage change to Cloud Function (HUGE!!)
- refactor 
    standby until migrating Server SDK from PHP > NODE.JS
- refactoring
    sending methods to cloud functions
- clean up unused functions



#### 04/2017

**0.8.0**

- shipment
    detail
    view fix
    create form fix
- signup merge
    refactor
    bypass phone verification
- settings
    refactor
- set operator role
- start / signup
    restyle
- cloud functions
    init
    set email validation function
- first release
    build for android
    ionic deploy test (failed)
    publish beta


#### 03/2017

**0.7.9**

- mercadopago
    document
    fixes
    refactoring
    npm updates
    write to db
- sending, shipment
    set paid,  set enabled
    fix bugs
- update ionic libs
- update ionic 2.2.0
- set ionic view    
- firebase fix post update



#### 02/2017

**0.7.5**

- payment
    backend
    show errors
    process chechout
    validate all conditions
    process all condition
- update ionic 2.0    



#### 01/2017

**0.7.0**

- update Ionic RC5
- refactoring (sending, shipment, user)
- shipment details
- update angularfire
- payment
    init
    mercadopago
    form
    transaction
    token
    checkout



#### 12/2016

**0.6.0**

- shipment
    confirm shipment
    list view
    detail view
    notifications
- account
    init
    update settings
    logs
    notifications
    show notification in detail
- local notifications
- update ionic-app-scripts 0.48
- stage > live



#### 11/2016

**0.5.0**
- update ionic RC1 > RC2      
    - save and set - angularfire
    - public ID (hashid)
    - storage photo
- sending
    form 1, 2, 3, 4
    time range
    hashid (public ID)
    sneding image
    sending view
    map options
- shipment
    form create shipment
- signup merge
    auth user email verification
    profile image update
    menu avatar fix
- update ionic RC3
- ionic view implementation



#### 10/2016

**0.4.0**
- update ionic RC0 > RC1 
    // firebase type fix angularfire/node_modules/firebase/firebase.d.ts:286
    declare namespace firebase.database.ServerValue {
        var TIMESTAMP: any;
    }        
-  form envio
    - inputs validation
    - camera
    - fix rangeTime change (min 2 hr)
    - go back, go forward
    - maps autocomplete
    - maps set center
    - maps set marker
    - maps set directions
    - maps set distance

**0.3.1** 
- update ionic beta11 > RC0
    - ref:   https://github.com/driftyco/ionic/blob/master/CHANGELOG.md#steps-to-upgrade-to-rc0
    - start new project
        > ionic start moovenAppDev sidemenu --v2
    - copy project
        4 copy app/pages > src/pages, copy app/providers > src/providers
        5 modify templateUrl to relative to .ts
        6 Import and add each of your pages to the declarations array and the entryComponents array in src/app/app.module.ts
        7 n/a
        8 Import and add each of your providers to the providers array in src/app/app.module.ts.
        9 Remove any use of the providers, pipes and directives arrays in @Component.
        10 Change any uses of the private TypeScript keyword to public ONLY for component variables that are needed in the associated template.
        11 Change 'button' to 'button ion-button'  
        12 Pass colors to the color attribute : 'button primary' changes to 'button color="primary"'
        13 config
        14 scss variables > app/variables.scss
        15 add selectors for scss files

**0.2.1**
- login
    - email validado
        - confirmar cuenta de email (link email)    
        - soft lock, avisar que debe validarlo, pero dejar que use la app   
        - auto check email validado, cambiar estado
        - password reset modal
- Settings - pagina de perfil  
    vista datos de perfil  
    cambio email
        validacion email via link, cambio a estado no validado
        actualizacion account
        envio email restauracion direccion anterior
    cambio nombre
    cambio telefono
- Sendings
    - form step 1


#### 09/2016

**0.1.1**  
- Implementación Firebase  
    integración librería  
    prueba autenticación  
    prueba conexión a base de datos  
- Registración  
    Form de registro - email&password
        - enviar email de validación
    Form de registro perfil - nombre, apellido, movil  
    Envío de email para validación de dirección de correo
- login  
    Form de login  
        - Validaciones  
            - cuenta activa  
            - cuenta existente  
            - registro básico completo  
- logout  
    boton logout en pagina perfil  
    boton logout en pagina registro  



#### 08/2016  

**0.0.0**  
- prototipo 1 - base (mockup)  
    ionic creator  
    validación UI/UX  
- prototipo 2 - final  
    bootstrap code en Ionic 2  
    UX final  
    funcionalidad básica real  
    diseño UI
    debug en dispositivo real (Android)  
    preview en ionic View (Android/iOS)  
    validación UI/UX



### Registración

- Providers  
    Firebase (email y contraseña)
    Google (google account)
    Facebook (facebook account)

- Formularios
    - A autenticacíon
        email y contraseña ó google ó facebook
    - B completar registración    
        nombre, apellido, movil
    - C validar nro de móvil
        código de validación

- Validaciones
    - para ingresar a la app    
        - se solicita completar registración (nombre, apellido, email, móvil)
    - para perfil envíos (crear solicitud)
        - dirección de correo validada (vía email)
        - nro de móvil validado (via sms)
    - para perfil cargas (aceptar envíos)
        - enviar datos personales (manual, via backend)


## RAFA FEEDBACK 

- OK__ timer pedidos, set 40 segundos
- OK__ TOS, el texto arriba del btn siguiente, poner check de confirmación y que lo valide
- OK__ nro de movil, no validar ahora       
- OK__ Operador, Queres registrarte como Operador? Envíanos un email con tus datos a contacto@moovenapp.com
- OK__ Validacion, usuario, email de validacion en español - (cloud function)
- STBY__ BUG, al sacar foto de servicio, se cuelga y no guarda foto (en IOS)
- page operador, cambiar texto por ganancia
- OK__ PRECIO - precio variable por km total
            tarifa minima $100
            precio por km $10.-
            primeros 25 - 10 x km     100
            sig 26-50 - 8 x km        120
                                    -------
                                      332        
            mas de 51 - 5 x km           
            comision mooven 30%
-----

    timer pedidos
        40 segundos 
    page operador
        cambiar texto por ganancia
    TOS
        el texto arriba del btn siguiente
        poner check de confirmación y que lo valide
    nro de movil
        no validar ahora       
    BUG
        al sacar foto de servicio
        se cuelga y no guarda foto
    PRECIO
        precio por km $10.-
            precio variable por km total
                tarifa minima $100
                primeros 25 - 10 x km     100
                sig 26-50 - 8 x km        120
                                        -------
                                          332          
                mas de 51 - 5 x km           
        comision mooven 30%
    Operador
        Queres registrarte como Operador?
        Envíanos un email con tus datos a contacto@moovenapp.com
    Validacion
        usuario
            email de validacion en español - usar mailgun
