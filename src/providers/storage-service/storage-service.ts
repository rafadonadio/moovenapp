import { Injectable } from '@angular/core';
import firebase from 'firebase';

const USER_FILES = 'userFiles/';

@Injectable()
export class StorageService {


    constructor() {
    }

    // get storage reference for sending image
    getSendingImageRef(userId:string, sendingId:string, fileExtension:string = '.jpg') {
        return firebase.storage().ref(USER_FILES)
                        .child(userId)
                        .child(sendingId + fileExtension);
    }

    getImageStringFormatAndType(): {format:string; type:string} {
        return {
            format: firebase.storage.StringFormat.DATA_URL,
            type: 'image/jpeg'
        }
    }


}
