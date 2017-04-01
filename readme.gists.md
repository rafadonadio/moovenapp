



# didEnter / didLeave
    // for subscribing and unsubscribing

    import { ViewController } from 'ionic-angular';

    ngOnInit() {
        this.viewCtrl.didEnter.subscribe( () => {
            console.log('__X__didEnter()');
            ...
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('__X__didLeave()');
            ...
        });
    }


# suscribe

        // get
        let service = get();
        let subscription = service.subscribe(snapshot => {
            ....
            subscription.unsubscribe();
        });