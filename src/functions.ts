import {
  Params,
  PaytmConfigurationValidator,
  RequestBodyParams,
} from "./interface";
import PaytmChecksum from "./utils/lib/node/checksum";

class Constants {
  CreateURL(env: "TEST" | "LIVE" = "TEST", queryParams: string): string {
    if (env === "TEST") {
      return `https://securegw-stage.paytm.in/theia/processTransaction?${queryParams}`;
    } else {
      return `https://securegw.paytm.in/theia/processTransaction?${queryParams}`;
    }
  }
  async CreateChecksum(params: Params, key: string) {}
  CreateSSOToken() {}
  GenerateParams(
    params: RequestBodyParams,
    settings: PaytmConfigurationValidator
  ) {
    let PaymentDetails: Params = {
      MID: "",
      ORDER_ID: "",
      CUST_ID: "",
      TXN_AMOUNT: "",
      EMAIL: "",
      CHANNEL_ID: "",
      MOBILE_NO: "",
      CALLBACK_URL: "",
      INDUSTRY_TYPE_ID: "",
    };
    PaymentDetails.MID = settings.PAYTM_MERCHANT_ID;
    PaymentDetails.ORDER_ID = params.orderId + new Date().getTime();
    PaymentDetails.CUST_ID = params.custId;
    PaymentDetails.TXN_AMOUNT = params.amount;
    PaymentDetails.EMAIL = params.email;
    PaymentDetails.MOBILE_NO = params.phone;
    PaymentDetails.CHANNEL_ID = "WEB";
    PaymentDetails.CALLBACK_URL = settings.CALLBACK_URL;
    PaymentDetails.WEBSITE = settings.PAYTM_MERCHANT_WEBSITE;
    PaymentDetails.INDUSTRY_TYPE_ID = "Retail";

    return PaymentDetails;
  }
}
export default new Constants();
