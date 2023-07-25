import {
  Params,
  PaytmConfigurationValidator,
  RequestBodyParams,
} from "./interface";
// import PaytmChecksum from "./test";

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
      ORDERID: "",      
       
    };
    PaymentDetails.MID = settings.PAYTM_MERCHANT_ID;
    PaymentDetails.ORDERID = params.orderId + new Date().getTime();    
        
    

    return PaymentDetails;
  }
}
export default new Constants();
