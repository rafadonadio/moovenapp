

# ANDROID

    GUIDE
        http://ionicframework.com/docs/v1/guide/publishing.html

    production build
        $ ionic run android --prod    

        $ cordova plugin rm cordova-plugin-console
        $ cordova build --release android

    Signing Android Applications
        
        go to JAVA installed folder
            $ cd %JAVA_HOME%\bin
        
        generate key
            $ keytool -genkey -v -keystore c:\ANDROID\my-release-key.keystore -alias mooven -keyalg RSA -keysize 2048 -validity 10000
                secret
                secret

        sign the unsigned APK: run the jarsigner tool which is also included in the JDK:
            $ jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore c:\ANDROID\my-release-key.keystore D:\vmbox\mooven\dev\MoovenAppDev\platforms\android\build\outputs\apk\android-release-unsigned.apk mooven

        run the zip align tool to optimize the APK
            C:\Users\RW\AppData\Local\Android\sdk\build-tools\24.0.2\zipalign
            $ C:\Users\RW\AppData\Local\Android\sdk\build-tools\24.0.2\zipalign -v 4 D:\vmbox\mooven\dev\MoovenAppDev\platforms\android\build\outputs\apk\android-release-unsigned.apk android.apk

    
    


