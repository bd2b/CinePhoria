export var CinephoriaErrorCode;
(function (CinephoriaErrorCode) {
    CinephoriaErrorCode["TOKEN_EXPIRE"] = "TOKEN_EXPIRE";
    CinephoriaErrorCode["TOKEN_REFRESH_FAIL"] = "TOKEN_REFRESH_FAIL";
    CinephoriaErrorCode["AUTH_REQUIRED"] = "AUTH_REQUIRED";
    CinephoriaErrorCode["API_ERROR"] = "API_ERROR";
    CinephoriaErrorCode["UNKNOWN"] = "UNKNOWN";
})(CinephoriaErrorCode || (CinephoriaErrorCode = {}));
export class CinephoriaError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, CinephoriaError.prototype);
    }
}
