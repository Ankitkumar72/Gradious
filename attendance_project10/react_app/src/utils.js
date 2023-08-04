import jwt_decode from "jwt-decode";
export function getDataFromStorage(key) {
    //decoding the jwt access token comming from server
    if (window.localStorage.getItem("tokenKey")) {
        let result = jwt_decode(window.localStorage.getItem("tokenKey"));
        if (result.hasOwnProperty(key)) {
            // console.log("getDataFromStorage"+key+result[key])
            return result[key].toString();
        } else {
            return null;
        }
    }
}