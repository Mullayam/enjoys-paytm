/// <reference path="./src/lib.ts" />

import { PaytmConfigurationValidator } from "./src/interface";
import { ServiceProvider } from "./src/lib";

export class PaytmConfig extends ServiceProvider.Paytm {
  constructor(config: PaytmConfigurationValidator) {
    super(config);
  }
}
