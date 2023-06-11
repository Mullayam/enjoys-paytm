"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genchecksumforrefund = exports.genchecksumbystring = exports.verifychecksumbystring = exports.verifychecksum = exports.genchecksum = void 0;
var util = require("util");
var crypto = require("crypto");
var secure_1 = require("./secure");
//mandatory flag: when it set, only mandatory parameters are added to checksum
function paramsToString(params, mandatoryflag) {
    var data = "";
    var tempKeys = Object.keys(params);
    tempKeys.sort();
    tempKeys.forEach(function (key) {
        if (key !== "CHECKSUMHASH") {
            if (params[key] === "null")
                params[key] = "";
            if (!mandatoryflag) {
                data += params[key] + "|";
            }
        }
    });
    return data;
}
function genchecksum(params, key, cb) {
    var data = paramsToString(params);
    secure_1.default.gen_salt(4, function (err, salt) {
        var sha256 = crypto
            .createHash("sha256")
            .update(data + salt)
            .digest("hex");
        var check_sum = sha256 + salt;
        var encrypted = secure_1.default.encrypt(check_sum, key);
        cb(undefined, encrypted);
    });
}
exports.genchecksum = genchecksum;
function genchecksumbystring(params, key, cb) {
    secure_1.default.gen_salt(4, function (err, salt) {
        var sha256 = crypto
            .createHash("sha256")
            .update(params + "|" + salt)
            .digest("hex");
        var check_sum = sha256 + salt;
        var encrypted = secure_1.default.encrypt(check_sum, key);
        var CHECKSUMHASH = encodeURIComponent(encrypted);
        CHECKSUMHASH = encrypted;
        cb(undefined, CHECKSUMHASH);
    });
}
exports.genchecksumbystring = genchecksumbystring;
function verifychecksum(params, key, checksumhash) {
    var data = paramsToString(params, false);
    //TODO: after PG fix on thier side remove below two lines
    if (typeof checksumhash !== "undefined") {
        checksumhash = checksumhash.replace("\n", "");
        checksumhash = checksumhash.replace("\r", "");
        var temp = decodeURIComponent(checksumhash);
        var checksum = secure_1.default.decrypt(temp, key);
        var salt = checksum.substr(checksum.length - 4);
        var sha256 = checksum.substr(0, checksum.length - 4);
        var hash = crypto
            .createHash("sha256")
            .update(data + salt)
            .digest("hex");
        if (hash === sha256) {
            return true;
        }
        else {
            util.log("checksum is wrong");
            return false;
        }
    }
    else {
        util.log("checksum not found");
        return false;
    }
}
exports.verifychecksum = verifychecksum;
function verifychecksumbystring(params, key, checksumhash) {
    var checksum = secure_1.default.decrypt(checksumhash, key);
    var salt = checksum.substr(checksum.length - 4);
    var sha256 = checksum.substr(0, checksum.length - 4);
    var hash = crypto
        .createHash("sha256")
        .update(params + "|" + salt)
        .digest("hex");
    if (hash === sha256) {
        return true;
    }
    else {
        util.log("checksum is wrong");
        return false;
    }
}
exports.verifychecksumbystring = verifychecksumbystring;
function genchecksumforrefund(params, key, cb) {
    var data = paramsToStringrefund(params);
    secure_1.default.gen_salt(4, function (err, salt) {
        var sha256 = crypto
            .createHash("sha256")
            .update(data + salt)
            .digest("hex");
        var check_sum = sha256 + salt;
        var encrypted = secure_1.default.encrypt(check_sum, key);
        params.CHECKSUM = encodeURIComponent(encrypted);
        cb(undefined, params);
    });
}
exports.genchecksumforrefund = genchecksumforrefund;
function paramsToStringrefund(params, mandatoryflag) {
    var data = "";
    var tempKeys = Object.keys(params);
    tempKeys.sort();
    tempKeys.forEach(function (key) {
        var m = params[key].includes("|");
        if (m == true) {
            params[key] = "";
        }
        if (key !== "CHECKSUMHASH") {
            if (params[key] === "null")
                params[key] = "";
            if (!mandatoryflag) {
                data += params[key] + "|";
            }
        }
    });
    return data;
}
