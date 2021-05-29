import {Status} from "./model/status.model";

export class CommonUtils {

    public static handleStatus(status: Status): Status {
        if (status.status === 'error') {
            throw status.payload;
        }

        return status;
    }

}
