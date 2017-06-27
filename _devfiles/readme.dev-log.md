
-------------------------------------------

- previous user sendings persist

    @20170401
        logout user1 and login user2, keeps showing sendings of user1

    issue
        sendingService user does not update after login
    
    fix
        set method setUser() public 
        call setUser() from sendings

-------------------------------------------

- gray box top  left 

    .scroll-content {
        overflow-y:auto;
    }    

--------------------------------------------

- Ionic v3 - Runtime Error Uncaught (in promise): removeView was not found 

        let alert = this.alertCtrl.create({
            title: '',
            message: '',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        // end with return false;
                        // when view is ending
                        return false;                   
                    }
                }
            ]
        });
        alert.present();
    
--------------------------------------------
  
https://github.com/ionic-team/ionic-app-scripts/issues/1001
- Module not found: Error: Can't resolve 'promise-polyfill' 

Issue:
    ionic upload
        Module not found: Error: Can't resolve 'promise-polyfill' in 'C:\ionic\CajaFuerte-app\node_modules\firebase\app'
        resolve 'promise-polyfill'

Solution:
    npm install promise-polyfill --save-exact

--------------------------------------------