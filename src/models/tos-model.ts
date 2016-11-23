
export class AccountToS {
    accepted: boolean;
    acceptedTimestamp: number;
    acceptedVersionId: number;
    acceptedVersionTag: string;
    history: Array<{ versionId:string, timestamp:number}>;
}

export const TOS_CFG = {
    CURRENT_VERSION_TAG: '2016.11.01.0001',
    CURRENT_VERSION_ID: 1,
    VERSIONS: {
        1: {
            tag: '2016.11.01.0001',
            date: '2016-11-03',
        }
    }    
}