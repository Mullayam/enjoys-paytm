import { NextFunction, Request, Response } from "express";
export interface StringValidator {
  InitializeTransaction(req: Request, res: Response): void;
  VerifyPaymentStatus(req: Request, res: Response): void;
  CallBack(req: Request, res: Response, next: NextFunction): void;
}

export interface CallBack {
  redirect: boolean;
  onSuccess?: string | "/";
  onFailure?: string | "/";
}
type PAYTM_MERCHANT_WEBSITE = "DEFAULT" | "WEBSTAGING";
export interface PaytmConfigurationValidator {
  PAYTM_ENVIRONMENT: "TEST" | "LIVE";
  PAYTM_MERCHANT_ID: string;
  PAYTM_MERCHANT_KEY: string;
  PAYTM_MERCHANT_WEBSITE: PAYTM_MERCHANT_WEBSITE;
  CALLBACK_URL: string;
  PAYTM_CHANNEL?: "WEB";
  PAYTM_INDUSTRY_TYPE?: "Retail" | string;
}
export interface UserInfoType {
  custId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address: string;
  pincode?: string;
  displayName?: string;
}
export interface ResultInfoType {
  resultCode: string;
  resultStatus: string;
  resultMsg?: string;
  isRedirect?: boolean;
  bankRetry?: boolean;
  retry?: boolean;
}
export interface PaymentDetailType {
  channelId: string;
  orderId: string;
  txnAmount: Money;
  userInfo: UserInfoType;
}
export interface Money {
  currency: MoneyCurrencyAllowed;
  value?: number;
}
enum MoneyCurrencyAllowed {
  "INR",
  "USD",
  "EUR",
}
export interface InitiateTransactionResponse {
  head: SecureResponseHeader;
  body: InitiateTransactionResponseBody;
}
export interface InitiateTransactionRequestBody {
  requestType: string;
  mid: string;
  websiteName: string;
  orderId: string;
  callbackUrl: string;
  txnAmount: Money;
  userInfo: UserInfoType;
}
export interface SecureResponseHeader {
  clientId?: string;
  channelId?: string;
  signature: string;
  responseTimestamp: string;
  version: string;
}
export interface InitiateTransactionResponseBody {
  resultInfo: ResultInfoType;
  txnInfo?: ResponseTransactionInfo;
  txnToken?: string;
  isPromoCodeValid?: boolean;
  extraParamsMap?: object;
  callBackUrl?: boolean;
}
export interface ResponseTransactionInfo {
  MID: string;
  TXNID: string;
  ORDERID: string;
  BANKTXNID: string;
  TXNAMOUNT: string;
  CURRENCY: string;
  STATUS: PaymentStatus;
  RESPCODE: string;
  RESPMSG: string;
  TXNDATE: string;
  GATEWAYNAME?: string;
  PAYMENTMODE?: string;
  CHECKSUMHASH: string;
  VPA?: string;
}
enum PaymentStatus {
  "TXN_SUCCESS",
  "TXN_FAILURE",
  "PENDING",
}
type SetParams =
  | "MID"
  | "ORDER_ID"
  | "CUST_ID"
  | "TXN_AMOUNT"
  | "EMAIL"
  | "CHANNEL_ID"
  | "MOBILE_NO"
  | "CALLBACK_URL";

export type Params = {
  [key in SetParams]: string;
} & {
  WEBSITE?: PAYTM_MERCHANT_WEBSITE;

  INDUSTRY_TYPE_ID: string | "Retail";
};
export interface RequestBodyParams {
  amount: string;
  custId: string;
  orderId: string;
  email: string;
  phone: string;
}

export interface PaytmParamsBody {
  orderId: string;
}
export type VerifyPaymentStatusParamsType = {
  body?: any;
  head?: any;
};
type ResponseBodyResultInfo = {
  resultStatus: string;
  resultCode: string;
  resultMsg: string;
};
export type ResponseBody = {
  body: {
    resultInfo: ResponseBodyResultInfo;
    txnId?: string;
    bankTxnId?: string;
    orderId?: string;
    txnAmount?: string;
    txnType?: string;
    gatewayName?: string;
    bankName?: string;
    mid?: string;
    paymentMode?: string;
    refundAmt?: string;
    txnDate?: string;
    authRefId?: string;
  };
};
