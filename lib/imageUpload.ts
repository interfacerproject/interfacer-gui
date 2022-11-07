import CryptoJS from "crypto-js";
import BASE64URL from "crypto-js/enc-base64url";
import SHA512 from "crypto-js/sha512";
import signFile from "zenflows-crypto/src/sign_file";
import { zencode_exec } from "zenroom";

//

export function formatZenObjects(o: Object): string {
  return JSON.stringify(o, null, 4);
}

export function createZenKeys(eddsa: string): string {
  const zenKeys = {
    keyring: {
      eddsa,
    },
  };
  return formatZenObjects(zenKeys);
}

export function createZenData(hashedFile: string): string {
  const zenData = {
    hashedFile,
  };
  return formatZenObjects(zenData);
}

//

export function arrayBufferToWordArray(ab: any) {
  let i8a = new Uint8Array(ab);
  let a = [];
  for (let i = 0; i < i8a.length; i += 4) {
    a.push((i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | i8a[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

//

export async function prepImageForUpload(f: File, eddsa: string) {
  const hash = await BASE64URL.stringify(SHA512(arrayBufferToWordArray(await f.arrayBuffer())));

  const signature = await zencode_exec(signFile(), {
    data: createZenData(hash),
    keys: createZenKeys(eddsa),
  }).then(({ result }) => JSON.parse(result).eddsa_signature);

  return {
    name: f.name,
    description: f.name,
    extension: f.name.split(".").at(-1),
    hash,
    mimeType: f.type,
    size: f.size,
    signature,
  };
}
