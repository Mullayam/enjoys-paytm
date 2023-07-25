import { NextFunction, Request, Response } from "express";
import {
  CallBack,
  Params,
  PaytmConfigurationValidator,
  PaytmParamsBody,
  PaytmParamsBodyServerLess,
  ResponseBody,
  StringValidator,
  VerifyPaymentStatusParamsType,
} from "./interface";
import Constants from "./functions";
import PaytmChecksum from "./utils/lib/node/checksum";
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

      const queryParams = `mid=${Paytm.PaytmConfig.PAYTM_MERCHANT_ID}&orderId=${params.ORDERID}`;
      const txn_url = Constants.CreateURL(
        Paytm.PaytmConfig.PAYTM_ENVIRONMENT,
        queryParams
      );
      const ChecksumSignature = await PaytmChecksum.generateSignature(
        params,
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY
      );
      let inputFields = "";
      inputFields += `<input type="text" name="CHECKSUMHASH" value='${ChecksumSignature}'>`;
      (Object.keys(params) as (keyof typeof params)[]).forEach((key) => {
        inputFields += `<input type="text" name="${key}" value="${params[key]}">`;
      });

      res.writeHead(200, { "Content-Type": "text/html", });
      res.write(`
      <html>
        <head>
          <title>Merchant Checkout Page</title>
        </head>
        <body>
            <center>
              <h1>Please do not refresh this page...</h1>
            </center>
               <form method="post" action="${txn_url}" name="f1">' 
              ${inputFields} 
            </form>
           <script type="text/javascript">document.f1.submit();</script>
        </body>
      </html>
      `);
      res.end();
    }
    async CallBack(req: Request, res: Response, next: NextFunction) {

      let PaymentDetails: Params = {
        MID: req.body.MID,
        ORDERID: req.body.ORDERID,

      };
      let checksumhash = req.body.CHECKSUMHASH;
      const result = PaytmChecksum.verifySignature(
        JSON.stringify(PaymentDetails),
        Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
        checksumhash
      );
      console.log(result)
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
          req.body.response = response
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
    async GetTxnStatus(req: Request, res: Response) {
      // Send Server-to-Server request to verify Order Status 
      var params = {
        MID: Paytm.PaytmConfig.PAYTM_MERCHANT_KEY,
        ORDERID: req.body.ORDERID,
      };
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
          res.status(200).json({
            message: req.body.response.body.resultInfo,
            body: req.body.response,
          })
          res.end();
        });
      });
      post_req.write(post_data);
      post_req.end();
    }
    async NextServer(req: Request, res: Response) {
      try {
        if (!req.body.amount) {
         throw new Error("Amount is required"); 
        }
        if (!req.body.orderId) {
          throw new Error("OrderId is required"); 
         }
        const paytmParams: PaytmParamsBodyServerLess = {}
        paytmParams.body = {
          requestType: "Payment",
          mid: Paytm.PaytmConfig.PAYTM_MERCHANT_ID,
          websiteName: Paytm.PaytmConfig.PAYTM_MERCHANT_WEBSITE,
          orderId: req.body.orderId,
          callbackUrl: Paytm.PaytmConfig.CALLBACK_URL,
          txnAmount: {
            value: req.body.amount as string,
            currency: "INR",
          },
          userInfo: {
            custId: "",
            email: `${req.body.email}`,
          },
        }
        const checksum = await PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          Paytm.PaytmConfig.PAYTM_MERCHANT_KEY
        )
        paytmParams.head = {
          signature: checksum,
        }
        const post_data = JSON.stringify(paytmParams)
        const queryParams = `mid=${Paytm.PaytmConfig.PAYTM_MERCHANT_ID}&orderId=${paytmParams.body.orderId}`
        const options = {
          hostname:
            Paytm.PaytmConfig.PAYTM_ENVIRONMENT === "LIVE"
              ? "securegw.paytm.in"
              : "securegw-stage.paytm.in",
          port: 443,
          path: `/theia/api/v1/initiateTransaction?${queryParams}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": post_data.length,
          },
        }
        type responseChunk = {
          body?: any
          head?: any
        }
        let response: responseChunk = {}

        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response = JSON.parse(chunk)
          })
          post_res.on("end", function () {
            const html = `
                <html>
               <head>
                  <title>Happift - Payment Page</title>
               </head>
               <body>
                  <center>
                     <h1>Please do not refresh this page...</h1>
                  </center>
                  <form method="post" action="https://${options.hostname}/theia/api/v1/showPaymentPage?${queryParams}" name="paytm">
                     <table border="1">
                        <tbody>
                           <input type="hidden" name="mid" value="${Paytm.PaytmConfig.PAYTM_MERCHANT_ID}">
                           <input type="hidden" name="orderId" value="${paytmParams.body?.orderId}">
                           <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                        </tbody>
                     </table>
                     </form>
                     <script type="text/javascript"> document.paytm.submit(); </script>
               </body>
            </html>`
            res.send(html)
            res.end()
          })
        })
        post_req.write(post_data)
        post_req.end()

      } catch (error) {
        res.redirect('/callback')
      }
    }
  }

}
