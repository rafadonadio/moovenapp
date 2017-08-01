import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import firebase from 'firebase';

@Injectable()
export class AuthService {

    fbuser: firebase.User;

    constructor(public afAuth: AngularFireAuth) {
        this.subscribeState();
    }    

    subscribeState() {
        // subscribe to user change
        this.firebaseAuthObservable().subscribe( user => {
            if(user) {
                this.setFbuser();
            }
        });
    }

    reload() {
        this.fbuser.reload()
            .then(() => {
                this.setFbuser();
            });
    }

    private setFbuser() {
        this.fbuser = this.afAuth.auth.currentUser;
    }

    /**
     *  Firebase Authentication
     */    

    // AuthState Observable
    // SHARED: http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-share
    firebaseAuthObservable(): Observable<firebase.User> {
        return this.afAuth.authState.share();
    }

    /**
     *  CREATE
     */

    createUserWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    }


    /**
     *  SIGNIN/OUT
     */

    // signin firebase user with email and password
    signInWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    // Signout firebase user
    // AUTH STATE CHANGE WATCHER will send user to start page
    signOut() {
        firebase.auth().signOut();
        this.fbuser = null;
    }

    // Sends a password reset email to the given email address.
    sendPasswordResetEmail(email: string): firebase.Promise<any> {
        return firebase.auth().sendPasswordResetEmail(email);
    }
    


}