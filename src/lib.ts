import { NextFunction, Request, Response } from "express";
import {
  CallBack,
  Params,
  PaytmConfigurationValidator,
  PaytmParamsBody,
  ResponseBody,
  StringValidator,
  VerifyPaymentStatusParamsType,
} from "./interface";
import Constants from "./functions";
import PaytmChecksum from "./utils/lib/node/checksum";

import { genchecksum, verifychecksum } from "./utils/lib/node/patym-checksum";
import * as https from "https";

export namespace ServiceProvider {
  export class Paytm implements StringValidator {
    protected static PaytmConfig: PaytmConfigurationValidator = {
      PAYTM_ENVIRONMENT: "TEST",
      PAYTM_MERCHANT_ID: "",
      PAYTM_MERCHANT_KEY: "",
      PAYTM_MERCHANT_WEBSITE: "DEFAULT",
      CALLBACK_URL: "",
    };
    protected ConfigParameters: any;

    constructor(config: PaytmConfigurationValidator) {
      Paytm.PaytmConfig = config;
    }
    async InitializeTransaction(req: Request, res: Response) {
      const params = Constants.GenerateParams(
        req.body,
        Paytm.PaytmConfig
      ) as Params;
      const queryParams = `mid=${Paytm.PaytmConfig.PAYTM_MERCHANT_ID}&orderId=${params.ORDER_ID}`;
      const txn_url = Constants.CreateURL(
        Paytm.PaytmConfig.PAYTM_ENVIRONMENT,
        queryParams
      );
      const ChecksumSignature = await PaytmChecksum.generateSignature(
        params,
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY
      );
      let inputFields = "";
      inputFields += `<input type="hidden" name="CHECKSUMHASH" value='${ChecksumSignature}'>`;
      (Object.keys(params) as (keyof typeof params)[]).forEach((key) => {
        inputFields += `<input type="hidden" name="${key}" value="${params[key]}">`;
      });
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          inputFields +
          '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
      );
      res.end();
    }
    async CallBack(req: Request, res: Response, next: NextFunction) {
      const body = req.body;
      let checksumhash = body.CHECKSUMHASH;
      const result = verifychecksum(
        body,
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
        checksumhash
      );

      // Send Server-to-Server request to verify Order Status
      var params = {
        MID: Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
        ORDERID: body.ORDERID,
      };

      genchecksum(
        params,
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
        function (err: any, ChecksumSignature: string) {
          checksumhash = ChecksumSignature;
          const post_data = "JsonData=" + JSON.stringify(params);

          var options = {
            hostname:
              Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
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
        }
      );
    }
    async VerifyPaymentStatus(req: Request, res: Response) {
      const Body: PaytmParamsBody = req.body;

      let VerifyPaymentStatusParams: VerifyPaymentStatusParamsType = {
        head: {},
        body: {},
      };
      VerifyPaymentStatusParams.body = {
        mid: Paytm.PaytmConfig.PAYTM_MERCHANT_ID,
        orderId: Body.orderId,
      };

      const CreatedNewChecksum = await PaytmChecksum.generateSignature(
        JSON.stringify(VerifyPaymentStatusParams.body),
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY
      );
      VerifyPaymentStatusParams.head = {
        signature: CreatedNewChecksum,
      };
      const post_data = JSON.stringify(VerifyPaymentStatusParams);
      var options = {
        hostname:
          Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
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
      let response: ResponseBody;
      let status: string = "";
      let post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response = JSON.parse(chunk);
        });
        post_res.on("end", async function () {
          if (response.body.resultInfo.resultCode === "01") {
            status = "SUCCESS";
          } else {
            status = response.body.resultInfo.resultStatus.split("_")[1];
          }
          res.status(200).json({
            message: response.body.resultInfo.resultStatus,
            body: response.body,
          });
          res.end();
        });
      });

      post_req.write(post_data);
      post_req.end();
    }
    protected async OnComplete(
      req: Request,
      res: Response,
      callBack: CallBack,
      done: any
    ) {
      const { response } = req.body;
      done();
      if (callBack.redirect) {
        response.STATUS === "TXN_SUCCESS"
          ? res.redirect(`${callBack.onSuccess}`)
          : res.redirect(`${callBack.onFailure}`);
      }
    }
  }
}
