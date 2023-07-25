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
                            queryParams = "mid=".concat(Paytm.PaytmConfig.PAYTM_MERCHANT_ID, "&orderId=").concat(params.ORDERID);
                            txn_url = functions_1.default.CreateURL(Paytm.PaytmConfig.PAYTM_ENVIRONMENT, queryParams);
                            return [4 /*yield*/, checksum_1.default.generateSignature(params, Paytm.PaytmConfig.PAYTM_MERCHANT_KEY)];
                        case 1:
                            ChecksumSignature = _a.sent();
                            inputFields = "";
                            inputFields += "<input type=\"text\" name=\"CHECKSUMHASH\" value='".concat(ChecksumSignature, "'>");
                            Object.keys(params).forEach(function (key) {
                                inputFields += "<input type=\"text\" name=\"".concat(key, "\" value=\"").concat(params[key], "\">");
                            });
                            res.writeHead(200, { "Content-Type": "text/html", });
                            res.write("\n      <html>\n        <head>\n          <title>Merchant Checkout Page</title>\n        </head>\n        <body>\n            <center>\n              <h1>Please do not refresh this page...</h1>\n            </center>\n               <form method=\"post\" action=\"".concat(txn_url, "\" name=\"f1\">' \n              ").concat(inputFields, " \n            </form>\n           <script type=\"text/javascript\">document.f1.submit();</script>\n        </body>\n      </html>\n      "));
                            res.end();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Paytm.prototype.CallBack = function (req, res, next) {
            return __awaiter(this, void 0, void 0, function () {
                var PaymentDetails, checksumhash, result;
                return __generator(this, function (_a) {
                    PaymentDetails = {
                        MID: req.body.MID,
                        ORDERID: req.body.ORDERID,
                    };
                    checksumhash = req.body.CHECKSUMHASH;
                    result = checksum_1.default.verifySignature(JSON.stringify(PaymentDetails), Paytm.PaytmConfig.PAYTM_MERCHANT_KEY, checksumhash);
                    console.log(result);
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
                                            req.body.response = response;
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
        Paytm.prototype.GetTxnStatus = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var params, post_data, options, response, post_req;
                return __generator(this, function (_a) {
                    params = {
                        MID: Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
                        ORDERID: req.body.ORDERID,
                    };
                    post_data = "JsonData=" + JSON.stringify(params);
                    options = {
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
                    response = "";
                    post_req = https.request(options, function (post_res) {
                        post_res.on("data", function (chunk) {
                            response += chunk;
                        });
                        post_res.on("end", function () {
                            req.body.response = JSON.parse(response);
                            res.status(200).json({
                                message: req.body.response.body.resultInfo,
                                body: req.body.response,
                            });
                            res.end();
                        });
                    });
                    post_req.write(post_data);
                    post_req.end();
                    return [2 /*return*/];
                });
            });
        };
        Paytm.prototype.NextServer = function (req, res) {
            return __awaiter(this, void 0, void 0, function () {
                var paytmParams_1, checksum, post_data, queryParams_1, options_1, response_1, post_req, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            if (!req.body.amount) {
                                throw new Error("Amount is required");
                            }
                            if (!req.body.orderId) {
                                throw new Error("OrderId is required");
                            }
                            paytmParams_1 = {};
                            paytmParams_1.body = {
                                requestType: "Payment",
                                mid: Paytm.PaytmConfig.PAYTM_MERCHANT_ID,
                                websiteName: Paytm.PaytmConfig.PAYTM_MERCHANT_WEBSITE,
                                orderId: req.body.orderId,
                                callbackUrl: Paytm.PaytmConfig.CALLBACK_URL,
                                txnAmount: {
                                    value: req.body.amount,
                                    currency: "INR",
                                },
                                userInfo: {
                                    custId: "",
                                    email: "".concat(req.body.email),
                                },
                            };
                            return [4 /*yield*/, checksum_1.default.generateSignature(JSON.stringify(paytmParams_1.body), Paytm.PaytmConfig.PAYTM_MERCHANT_KEY)];
                        case 1:
                            checksum = _a.sent();
                            paytmParams_1.head = {
                                signature: checksum,
                            };
                            post_data = JSON.stringify(paytmParams_1);
                            queryParams_1 = "mid=".concat(Paytm.PaytmConfig.PAYTM_MERCHANT_ID, "&orderId=").concat(paytmParams_1.body.orderId);
                            options_1 = {
                                hostname: Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
                                    ? "securegw.paytm.in"
                                    : "securegw-stage.paytm.in",
                                port: 443,
                                path: "/theia/api/v1/initiateTransaction?".concat(queryParams_1),
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Content-Length": post_data.length,
                                },
                            };
                            response_1 = {};
                            post_req = https.request(options_1, function (post_res) {
                                post_res.on("data", function (chunk) {
                                    response_1 = JSON.parse(chunk);
                                });
                                post_res.on("end", function () {
                                    var _a;
                                    var html = "\n                <html>\n               <head>\n                  <title>Happift - Payment Page</title>\n               </head>\n               <body>\n                  <center>\n                     <h1>Please do not refresh this page...</h1>\n                  </center>\n                  <form method=\"post\" action=\"https://".concat(options_1.hostname, "/theia/api/v1/showPaymentPage?").concat(queryParams_1, "\" name=\"paytm\">\n                     <table border=\"1\">\n                        <tbody>\n                           <input type=\"hidden\" name=\"mid\" value=\"").concat(Paytm.PaytmConfig.PAYTM_MERCHANT_ID, "\">\n                           <input type=\"hidden\" name=\"orderId\" value=\"").concat((_a = paytmParams_1.body) === null || _a === void 0 ? void 0 : _a.orderId, "\">\n                           <input type=\"hidden\" name=\"txnToken\" value=\"").concat(response_1.body.txnToken, "\">\n                        </tbody>\n                     </table>\n                     </form>\n                     <script type=\"text/javascript\"> document.paytm.submit(); </script>\n               </body>\n            </html>");
                                    res.send(html);
                                    res.end();
                                });
                            });
                            post_req.write(post_data);
                            post_req.end();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            res.redirect('/callback');
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
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
