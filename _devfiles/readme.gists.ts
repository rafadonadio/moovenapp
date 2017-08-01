



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


    // firebase database query string    
    queryStartAt(value:string): FirebaseListObservable<any> {
        return this.db.list(`/userAccount`, {
            query: { 
                orderByChild: 'profile/data/email',
                startAt: value,
                endAt: `${value}\uf8ff`
            }
        });
    }


    // BIG QUERY TEST

    const bigquery = require('@google-cloud/bigquery')();
    // LOG
    console.log('cloud env',functions.config().bigquery.datasetmoovendev, functions.config().bigquery.tabletasks);
    const dataset = bigquery.dataset(functions.config().bigquery.datasetmoovendev);
    const table = dataset.table(functions.config().bigquery.tabletasks);
    let row = {
        task_name: 'create_account',
        user_uid: firebaseUser.uid,
        trigger: 'auth.user().onCreate()',
        timestamp: timestamp
    };
    return table.insert(row);