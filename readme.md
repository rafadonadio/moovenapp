
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




> to-do´s
    - #email sending
        *implementar mailgun
    - login  
        recuperar contraseña  
        confirmar nro de movil  
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
