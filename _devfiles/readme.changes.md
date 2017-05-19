

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

                

### Pendientes
- Nuevo Servicio - Paso 2    
    - ingresar fecha  
    - validar horario  
- Nuevo Servicio - Paso 3  
    - ingresar fecha  
    - validar horario        
- ~~Nuevo Servicio - Paso 4~~  
    - ~~calculo precio~~
- Checkout
    - crear usuario MP
    - guardar datos tarjeta en MP

- Varios  
    - registrar cada acción de usuario  
    - obtener datos marca/modelo del dispositivo del usuario
- Ajustes  
    - boton para cerrar aplicación
    - notificaciones (locales/email) - revisar

--- 

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

#### 10/2016

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

#### 11/2016

**0.5.0**
- update ionic RC1 > RC2      
    - save and set - angularfire
    - public ID (hashid)
    - storage photo

...





#############
# TO_DO
#############
- sendings > item detail
- sendings > item en created_registered > habilitar boton de pago
- sendings > item en created_paid > habilitar boton de enable (en admin):
- sendings > item > live_inroute > set completed
- sendings > item > live > set canceled
- payment gateway > mercadopago

- ajustes: 
     - validar número de móvil 
     - guardar config user --OK
     - cerrar cuenta
- servicio: 
     - agregar fecha al pedido 
     - agregar opción de gestión
     - en vista item creado, agregar acciones permitidas al user (cancelar) --OK
     - procesar pago
- operador: 
     - en vista tomar servicio, listar vacantes en función de center-map + limite mapa, reaccionar a cuando el mapa se mueve y actualizar listado de vacantes.
     - listar servicios tomados por user --OK
     - vista item servicio tomado, agregar acciones permitidas al operador (actualizar avance, cancelar) 
     - vista historial y notificaciones
- pagos
- push notifications
- ayuda
- login, social auth: facebook


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



