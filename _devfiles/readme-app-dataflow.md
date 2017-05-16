
### Pendientes

    -





# APP WORK/DATA FLOW

## SIGNUP
### CREAR USUARIO
> completa email y contraseña  

*pages/signup/signup.ts*  
    
    submit()  
        form.invalid  
            showError
        form.valid  
            createUser()  
                goTo > createAccountStep1()  
                redirige a page para completar datos personales
            CF_Trigger > user.onCreate()
                dispara cloud function: setUserVerifyEmail
                envia email de validación de correo electronico ingresado

--- 

### CREAR USUARIO > STEP 2
> Datos adicionales del usuario:  
  nombre  
  apellido  
  telefono  
  ver y aceptar TOS  

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



