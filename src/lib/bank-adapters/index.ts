/**
 * Tüm banka adapter'larını kaydeder.
 * Bu dosyayı API route'larında import et.
 */
import { registerAdapter } from "./base";
import { IsBankAdapter } from "./isbank";
import { AkbankAdapter } from "./akbank";
import { GarantiAdapter } from "./garanti";
import { YapiKrediAdapter } from "./yapikredi";

let registered = false;

export function ensureAdaptersRegistered() {
  if (registered) return;
  registerAdapter(IsBankAdapter);
  registerAdapter(AkbankAdapter);
  registerAdapter(GarantiAdapter);
  registerAdapter(YapiKrediAdapter);
  registered = true;
}

export { getAdapter, listAdapters } from "./base";