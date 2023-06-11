"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProvider = void 0;
var functions_1 = require("./functions");
var checksum_1 = require("./utils/lib/node/checksum");
var patym_checksum_1 = require("./utils/lib/node/patym-checksum");
var https = require("https");
var ServiceProvider;
(function (ServiceProvider) {
    var Paytm = /** @class */ (function () {
        function Paytm(config) {
            Paytm.PaytmConfig = config;
        }
        Paytm.prototype.InitializeTransaction = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var params, queryParams, txn_url, ChecksumSignature, inputFields;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = functions_1.default.GenerateParams(req.body, Paytm.PaytmConfig);
                            queryParams = "mid=".concat(Paytm.PaytmConfig.PAYTM_MERCHANT_ID, "&orderId=").concat(params.ORDER_ID);
                            txn_url = functions_1.default.CreateURL(Paytm.PaytmConfig.PAYTM_ENVIRONMENT, queryParams);
                            return [4 /*yield*/, checksum_1.default.generateSignature(params, Paytm.PaytmConfig.PAYTM_MERCHANT_KEY)];
                        case 1:
                            ChecksumSignature = _a.sent();
                            inputFields = "";
                            inputFields += "<input type=\"hidden\" name=\"CHECKSUMHASH\" value='".concat(ChecksumSignature, "'>");
                            Object.keys(params).forEach(function (key) {
                                inputFields += "<input type=\"hidden\" name=\"".concat(key, "\" value=\"").concat(params[key], "\">");
                            });
                            res.writeHead(200, { "Content-Type": "text/html" });
                            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
                                txn_url +
                                '" name="f1">' +
                                inputFields +
                                '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                            res.end();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Paytm.prototype.CallBack = function (req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var body, checksumhash, result, params;
                return __generator(this, function (_a) {
                    body = req.body;
                    checksumhash = body.CHECKSUMHASH;
                    result = (0, patym_checksum_1.verifychecksum)(body, Paytm.PaytmConfig.PAYTM_MERCHANT_KEY, checksumhash);
                    params = {
                        MID: Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
                        ORDERID: body.ORDERID,
                    };
                    (0, patym_checksum_1.genchecksum)(params, Paytm.PaytmConfig.PAYTM_MERCHANT_KEY, function (err, ChecksumSignature) {
                        checksumhash = ChecksumSignature;
                        var post_data = "JsonData=" + JSON.stringify(params);
                        var options = {
                            hostname: Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
                                ? "securegw.paytm.in"
                                : "securegw-stage.paytm.in",
                            port: 443,
                            path: "/merchant-status/getTxnStatus",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Content-Length": post_data.length,
                            },
                        };
                        // Set up the request
                        var response = "";
                        var post_req = https.request(options, function (post_res) {
                            post_res.on("data", function (chunk) {
                                response += chunk;
                            });
                            post_res.on("end", function () {
                                req.body.response = JSON.parse(response);
                                next();
                            });
                        });
                        post_req.write(post_data);
                        post_req.end();
                    });
                    return [2 /*return*/];
                });
            });
        };
        Paytm.prototype.VerifyPaymentStatus = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var Body, VerifyPaymentStatusParams, CreatedNewChecksum, post_data, options, response, status, post_req;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Body = req.body;
                            VerifyPaymentStatusParams = {
                                head: {},
                                body: {},
                            };
                            VerifyPaymentStatusParams.body = {
                                mid: Paytm.PaytmConfig.PAYTM_MERCHANT_ID,
                                orderId: Body.orderId,
                            };
                            return [4 /*yield*/, checksum_1.default.generateSignature(JSON.stringify(VerifyPaymentStatusParams.body), Paytm.PaytmConfig.PAYTM_MERCHANT_KEY)];
                        case 1:
                            CreatedNewChecksum = _a.sent();
                            VerifyPaymentStatusParams.head = {
                                signature: CreatedNewChecksum,
                            };
                            post_data = JSON.stringify(VerifyPaymentStatusParams);
                            options = {
                                hostname: Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
                                    ? "securegw.paytm.in"
                                    : "securegw-stage.paytm.in",
                                port: 443,
                                path: "/v3/order/status",
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Content-Length": post_data.length,
                                },
                            };
                            status = "";
                            post_req = https.request(options, function (post_res) {
                                post_res.on("data", function (chunk) {
                                    response = JSON.parse(chunk);
                                });
                                post_res.on("end", function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            if (response.body.resultInfo.resultCode === "01") {
                                                status = "SUCCESS";
                                            }
                                            else {
                                                status = response.body.resultInfo.resultStatus.split("_")[1];
                                            }
                                            res.status(200).json({
                                                message: response.body.resultInfo.resultStatus,
                                                body: response.body,
                                            });
                                            res.end();
                                            return [2 /*return*/];
                                        });
                                    });
                                });
                            });
                            post_req.write(post_data);
                            post_req.end();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Paytm.prototype.OnComplete = function (req, res, callBack, done) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    response = req.body.response;
                    done();
                    if (callBack.redirect) {
                        response.STATUS === "TXN_SUCCESS"
                            ? res.redirect("".concat(callBack.onSuccess))
                            : res.redirect("".concat(callBack.onFailure));
                    }
                    return [2 /*return*/];
                });
            });
        };
        Paytm.PaytmConfig = {
            PAYTM_ENVIRONMENT: "TEST",
            PAYTM_MERCHANT_ID: "",
            PAYTM_MERCHANT_KEY: "",
            PAYTM_MERCHANT_WEBSITE: "DEFAULT",
            CALLBACK_URL: "",
        };
        return Paytm;
    }());
    ServiceProvider.Paytm = Paytm;
})(ServiceProvider = exports.ServiceProvider || (exports.ServiceProvider = {}));
