import {Status} from "./model/status.model";
import {ConfigKey} from "./model/config-key.model";


export class CommonUtils {

    private static readonly NEXT_LINE_TERMINATOR = '\x1b[0m';


    public static handleStatus(status: Status): Status {
        if (status.status === 'error') {
            throw status.payload;
        }

        return status;
    }

    public static getCurrentYear(): number {
        return new Date().getFullYear();
    }

    public static isValidJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    public static isConfigKeyPresent(configKey: ConfigKey, obj: any): boolean {
        return !!obj &&!!this.getConfigKeyValue(configKey, obj);
    }

    public static getConfigKeyValue(configKey: ConfigKey, obj: any): any {
        return obj ? obj[configKey.key] : null;
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
