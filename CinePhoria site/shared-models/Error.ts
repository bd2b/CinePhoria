export enum CinephoriaErrorCode {
    TOKEN_EXPIRE = "TOKEN_EXPIRE",
    TOKEN_REFRESH_FAIL = "TOKEN_REFRESH_FAIL",
    AUTH_REQUIRED = "AUTH_REQUIRED",
    API_ERROR = "API_ERROR",
    API_ERROR_SILENT = "API_ERROR_SILENT",
    UNKNOWN = "UNKNOWN"
}

export class CinephoriaError extends Error {
    code: CinephoriaErrorCode;

    constructor(code: CinephoriaErrorCode, message: string) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, CinephoriaError.prototype);
    }
}