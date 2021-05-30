import {ErrorCode} from "./error-code.enum";

export class ErrorCodeError extends Error {
    public errorCode: ErrorCode;
    public error?: Error;

    constructor(errorCode: ErrorCode, error?: Error) {
        super(errorCode.toString());
        this.errorCode = errorCode;
        this.error = error;
    }
}
