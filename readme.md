
# MOOVEN

### Mobile App
##### plataformas: Android, iOS
Desde la aplicación un usuario registrado (R) crea una solicitud de "envío de un objeto".
El software de backend guarda la solicitud y propaga inmediatamente a todos los usuarios registrados con perfil "cargas" (RC).  
Los usuarios (RC) pueden visualizar todas las solicitudes de envío creadas y que aun estén en espera de ser tomadas.


### Stack

    backend
        Firebase
            Authentication
            Realtime database
    App
        Ionic 2 / Angular2


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


___

### CHANGELOG

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

**0.5.0**
- update ionic RC1 > RC2      
    - save and set    
    - ID format AAA-999

    
    
# device debug
    
    "Attempt to use a destroyed view: detectChanges"
    "Error: Attempt to use a destroyed view: detectChanges 
        at e [as constructor] (file:///android_asset/www/build/main.js:5:13512)

    main.js:6 EXCEPTION: Firebase.update failed: 
        First argument contains undefined in property 
            'usersSendings.BEmkzTfvzDNefFWbTDDsJ1qBNUF3.active.-KVN54Ed6CM0TrqKcfVw.pickupAddressCity'


> to-do´s
    - settings  
        estado perfil para envíos  
        estado perfil para cargas  
        conf notificaciones  
            push  
            email  
        cerrar cuenta  
    - envios  
        - form nuevo envío  
        - listado envios  
    - cargas
        - listado cargas
        - form nueva carga
    - notificaciones
    - pagos
    - ayuda


