###############
# MERCADOPAGO
###############

API DOCS
    - https://www.mercadopago.com.ar/developers/

AYUDA (casi nula)

    Grupo de Google
        https://groups.google.com/forum/#!forum/mercadopago-developers
        (practicamente nadie responde las consultas)
    
    Stackoverflow
        http://es.stackoverflow.com/questions/tagged/mercadopago
        (practicamente nadie responde las consultas)

    Github
        https://github.com/mercadopago
        (practicamente nadie responde las consultas)

---

SDK
    Frontend
        Javascript
    
    Server Backend
        PHP
        framework lumen 5.4


SECUENCIA DEL PAGO
    1. Verifica form: 
        todos los campos completos 
            - mostrar errores de campos no completados
            - el campo nro de tarjeta se valida al mismo tiempo con MP API (guessPayment)
        (method form.valid)
    2. Token Data: 
        generar token con datos de form para obtener card token
            - payment method id obtenido con MP API 
        (method setTokenData)
    3. Card Token
        generar Card Token con MP API
            - API valida el correcto formarto de los campos de la tarjeta 
            - API devuelve errores con codigos
            - procesar errores, armar mensajes humanos y mostrarlos
    4. PrePayment Data
        generar prepayment data con tokenId de paso 3.
        completar con datos del servicio para posterior referencia(external_reference, etc)
    5. Crear Pago
        frontend:
            enviar prepayment data a nuestro server con PHP SDK instalado
            esperar respuesta 
            mostrar errores si hubiese en frontend
        BACKEND:
            verificar campos enviados en backend, devolver error si hubiese
            preparar payment data con valores enviados por frontend
            llamar a mp->post(/payment) y esperar respuesta
            
            <-------------------------------------------------------------->
            <--- hasta aca todo ok, prueba de flujo completo de pago OK --->
            <-------------------------------------------------------------->

            procesar respuestas:
                a. pago completado (respuesta en $payment)
                b. pago incompleto (respuesta en exception)
                    (## FALTA DOCUMENTACION)
                        Resuelto:
                        - capturar errores con MercadoPagoException
                        - parsear $e->message para obtener codigo de error y detail
                c. armar respuesta para frontend
                    http response 200, si el server responde correctamente
                    datos en json:
                        _payment: dato de pago completado (objeto completo devuleto por la API)
                        _paymentError: dato de codigo de error, detail y raw message
        FRONTEND:
            



#################
# ANALISIS FLOW
#################

        frontend:
            capturar respuesta de server    
                -  http code == 200 (respuesta recibida correctamente) ***
                    - _payment !== null, el pago posiblemente esté completo
                        (pago completo solo implica que MP lo proceso, es indistinto del resultado)
                        si _payment.status == 201, el pago esta completo
                            (## FALTA DOCUMENTACION, la duda es que cualquier otro código lo captura la exception 
                            por lo tanto el codigo siempre sería 201 .. )
                            _payment.response.status == 'rejected', el pago fue rechazado
                                _payment.response.status_detail, esta el "codigo" enviado por la API del resultado del pago completo
                                convertimos codigo de error en mensaje humano y mostramos
                                vuelve al form y se permite volver a intentar
                            _payment.response.status == 'approved', el pago fue aceptado
                                _payment.response.status_detail, esta el resultado de si esta "acreditado" o "pendiente"
                                    - "accredited", el pago se recibió OK 
                                        [[ {{__RAFA__}}: en este punto, cambiamos estado de servicio a Habilitado, disponible para ser tomado
                                        el tema a tener en cuenta, es que un pago acreditado, puede entrar en mediacion y posteriormente devuelto]]
                                        https://www.mercadopago.com.ar/developers/en/api-docs/basic-checkout/ipn/payment-status/
                                    - "in_process", el pago esta pendiente
                                        a su vez, pendiente tiene dos condiciones
                                            - pending_contingency: el pago se procesará en forma automática dentro de la prox hora
                                                [[ {{__RAFA__}}: en este punto debemos manualmente corroborar si el pago se acredito, o bien desarrollar la 
                                                funcionalidad para que automáticamente el server reciba la notificación IPN de MP +++++++++]]
                                            - pending_review_manual: el pago se procesará manualment por MP y puede demorar hasta 2 días.
                                                [[ {{__RAFA__}}: esta condición deberíamos tomarla como error, porque es posible que el pago se confirme 
                                                posterior a la fecha del servicio o que la persona no quiera esperar los dos días. 
                                                De tomarlo como error, debemos usar la API para cancelar el pago, evitar que el user vuelva a usar la misma tarjeta 
                                                y avisarle de todo lo que paso ++++++++++ ]]
                            _payment.response.status == 'rejected', el pago fue rechazado
                                _payment.response.status_detail, esta el motivo del rechazo
                                    - convertir codigo de MP en mensaje humano y mostrar
                                    (## FALTA DOCUMENTACION)
                                    El problema aqui es el Card Token generado en el punto 3.
                                    Solo puede usarse una vez, pero por algun motivo cuando quería volver a intentar
                                    luego de un pago rechazado, me devolvia error de token ya usado WTF!
                                    Soporte de MP es de terror, entonces buscando en el SDK encontre clearSession() que hacer lo que precisaba.
                                    Abrí consultas en todos los medios que dicen tener para preguntar ... sigo esperando 
                    - _payment == null && _paymentError!== null, el pago no se completo y tiene errores
                        el codigo de error lo tuve que parsear del message de la exception, como es posible que ese codigo no exista
                        establezco mensajes de error por defecto.
                        por las dudas armo mensajes humanos para los codigos mas comunes (error 400 tiene 40 errores posibles)
                        - permitir volver a intentar
            
            [[ {{__RAFA__}}: 
                consistencia: como manejamos conexión entre front y back, puede darse el caso que el server genere el pago correctamente pero que 
                              falle al devolver la respuesta a la app. Quedaría entonces un pago acreditado pero que la app nunca se entera. Con el riesgo de duplicar 
                              un pago ya realizado.
                              en este caso, la solucion ideal sería que en el server registremos todas las transacciones y que previo a hacer un pago
                              verificar si ya no se realizó antes. (implica nueva base de datos xq firebase no tiene SDK para PHP ++++++++++++)
                              En al APP si incluimos guardar el registro de todos los pagos (intentos, completados, acreditados, etc) y lo guardamos en firebase ]]
                              (hacer registro en Server)
                Gestion manual:
                              Deberiamos contemplar poder modificar manualmente el estado de un pago en Mooven, en función de cambios que sucedan en MP.
                              Situación:
                                - un servicio es pagado con MP desde la App, la API devuelve esta acreditado y se registra en la Mooven.
                                - el servicio se hace, pero luego por alguna razon el usuario reclama a MP, MP da a lugar y el pago acreditado se devuelve.
                                - en Mooven deberíamos poder cambiar manualmente el estado del servicio de "Pagado-acreditado" a "Reclamo-devuelto"
                              Esta funcionalidad de cambiar estado en formar manual se debiera incluir en el admin.                                 



        






    