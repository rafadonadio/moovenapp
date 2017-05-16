



// didEnter / didLeave
    // for subscribing and unsubscribing

    import { ViewController } from 'ionic-angular';

    ngOnInit() {
        this.viewCtrl.didEnter.subscribe( () => {
            console.log('__X__willEnter()');
            ...
        });
        this.viewCtrl.didLeave.subscribe( () => {
            console.log('__X__didLeave()');
            ...
        });
    }


// suscribe

        // get
        let service = get();
        let subscription = service.subscribe(snapshot => {
            if (snapshots) {
                snapshots.forEach(snapshot => {
                    let key = snapshot.key;
                    let item = {
                        key: key,
                        data: snapshot.val(),
                    };
                    list.push(item);
                });
            }

            // eventually
            subscription.unsubscribe();
        });