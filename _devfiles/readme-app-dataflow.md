
### Pendientes
- Nuevo Servicio - Paso 2    
    - ingresar fecha  
    - validar horario  
- Nuevo Servicio - Paso 3  
    - ingresar fecha  
    - validar horario        
- ~~Nuevo Servicio - Paso 4~~  
    - ~~calculo precio~~
- Varios  
    - registrar cada acción de usuario  
    - obtener datos marca/modelo del dispositivo del usuario
- Ajustes  
    - boton para cerrar aplicación
    - notificaciones (locales/email) - revisar

---    


# **LOGIC/DATA FLOW**

> IONIC APP: Usuario / Operador      

---

## **# DATA LOGIC MAP**

---  
     
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
            Perfiles
                _actualizar
                    actualiza vista estado perfil
            Avisos
                _toggle notificaciones locales  
                    habilita / deshabilita notificaciones locales
                _toggle email
                    habilita / deshabilita notificaciones via email

       

---

## **# Secciones**

---

## **SIGN-UP**
### CREAR USUARIO
> Form para crear usuario  
> Datos de registro:
>  - email 
>  - contraseña  

*pages/signup/signup.ts*  
    
    submit()  
        form.invalid  
            showError
        form.valid  
            createUser()  
                goTo > createAccountStep1()  
                    redirige a page para completar datos personales
            CF_Trigger 
                (ver Cloud Functions)
                user.onCreate()
                    dispara cloud function: setUserVerifyEmail
                    envia email de validación de correo electronico ingresado

--- 

### CREAR USUARIO > STEP 2
> Crear usuario paso 2  
> Este paso es forzado, si el usuario sale antes de completar, al loguerse nuevamente se redirige a esta pantalla.
> Solo puede salir de esta pantalla completando los datos requeridos.
>   
> Form para datos adicionales del usuario:    
>  - nombre  
>  - apellido  
>  - telefono  
>  - foto perfil (opcional)
>  - ver y aceptar TOS   

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

---

### AJUSTES  

> pagina de ajuste y visualización de datos del usuario.  
> Visualizar:  
>   - nombre y apellido
>   - dirección de email
>   - número de móvil
>   - Perfiles
>       - registro (estado del alta como usuario)  
>       - servicio (estado del alta como solicitante de servicio)
>       - operador (estado del alta como operador)  
>
> Acciones:  
> - foto de perfil
> - nombre y apellido
> - dirección de email  
> - número de movil
> - actualizar vista
>   - boton actualizar
>   - deslizar hacia abajo 
> Avisos
> - notifaciones vía email
> - notificaciones locales

*pages/settings/settings.ts*

    doRefresh()
        actualiza datos de la vista
    updateUserProfileStatus()
        actualiza estado de perfiles
    updateNotificationSettings()
        actualiza estado de las notificaciones
    updatePicture()
        modifica imagen perfil
    signOut()
        desloguearse

---


## **SERVICIOS**

### NUEVO SERVICIO - Paso 1/4
> Paso 1 de alta de servicio  
> form:  
> - foto (opcional)
> - Descripción corta
> - Tipo de objeto
> - Valor a declarar

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

---

### NUEVO SERVICIO - Paso 2/4
> Paso 2 de alta de servicio  
> form:  
> - dirección de retiro
> - banda horaria de Retiro
> - contacto para retiro

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
    

    submit()
        form.invalid
            showError
        form.valid
            update()
                guarda datos en app
            gotoNextStep()
   
---

### NUEVO SERVICIO - Paso 3/4
> Paso 3 de alta de servicio  
> form: Datos de la Entrega  
> - dirección de entrega
> - banda horaria de Entrega
> - contacto para entrega

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
   
---

### NUEVO SERVICIO - Paso 4/4 
> Paso 4 de alta de servicio  
> form: Confirmar Datos  
> - visualización completa de servicio cargado
> - visualización de trayecto dibujado en mapa
> - calculo de precio del servicio
> - confirmar crear servicio
> - redirigir a Pagar (Checkout)

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
        createSending()
            alert()
                opc:confirmar
                    sendingSrv.register()
                        getSummary()
                        dbSrv.newSending()
                        logNotifications()
                        uploadSendingImage()
                            updateSendingImage()
                        runPayment()
                            alert()
                                opc:pagar
                                    goToCheckout()
            
   
---

### CHECKOUT 
> ingresar datos de tarjeta de crédito 
> se crea pago con Mercadopago
> - si hubiese un error, se devuelve con mensaje en alerta

*pages/checkout/checkout.ts*

    ngOnInit()
           
   
---






TEMPLATE
---

### lorem ipsum 
> lorem ipsum  
> -  lorem ipsum 

*pages/yiytit/yorytort.ts*

    ngOnInit()      
   
---