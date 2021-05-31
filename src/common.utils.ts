import {Status} from "./model/status.model";
import {ErrorCode} from "./model/error-code.enum";
import {Observable, of} from "rxjs";
import {Color} from "./model/color.enum";


export class CommonUtils {

    private static readonly NEXT_LINE_TERMINATOR = '\x1b[0m';


    public static log(msg: string, color?: Color): void {
        if(color) {
            const formatStr = color.toString() + '%s' + CommonUtils.NEXT_LINE_TERMINATOR;
            console.log(formatStr, msg);
        } else {
            console.log(msg);
        }
    }

    public static handleStatus(status: Status): Status {
        if (status.status === 'error') {
            throw status.payload;
        }

        return status;
    }

    public static getCurrentYear(): number {
        return new Date().getFullYear();
    }

    // https://stackoverflow.com/questions/19448436/how-to-create-date-in-yyyymmddhhmmss-format-using-javascript
    public static getCurrentDateFormatted(): string {
        const date = new Date();

        const yyyy = date.getFullYear().toString();
        const MM = CommonUtils.pad(date.getMonth() + 1,2);
        const dd = CommonUtils.pad(date.getDate(), 2);
        const hh = CommonUtils.pad(date.getHours(), 2);
        const mm = CommonUtils.pad(date.getMinutes(), 2);
        const ss = CommonUtils.pad(date.getSeconds(), 2);

        return yyyy + MM + dd + '_' + hh + mm + ss;
    }

    // https://stackoverflow.com/questions/19448436/how-to-create-date-in-yyyymmddhhmmss-format-using-javascript
    private static pad(number: number, length: number): string {
        let str = '' + number;

        while (str.length < length) {
            str = '0' + str;
        }

        return str;
    }

}
