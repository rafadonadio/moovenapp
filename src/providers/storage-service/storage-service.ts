import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class StorageService {


    constructor() {
    }

    // get storage reference for sending image
    getSendingImageRef(userId:string, sendingId:string, fileExtension:string = '.jpg') {
        return firebase.storage().ref('userFiles/')
                        .child(userId)
                        .child(sendingId + fileExtension);
    }

    // get stotage  object format and type to be used
    getImageStringFormatAndType(): {format:string; type:string} {
        return {
            format: firebase.storage.StringFormat.DATA_URL,
            type: 'image/jpeg'
        }
    }


}
