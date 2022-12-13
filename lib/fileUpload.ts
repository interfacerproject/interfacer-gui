import CryptoJS from "crypto-js";
import BASE64URL from "crypto-js/enc-base64url";
import SHA512 from "crypto-js/sha512";
import { IFile } from "lib/types";
import signFile from "zenflows-crypto/src/sign_file";
import { zencode_exec, zenroom_hash_final, zenroom_hash_init, zenroom_hash_update } from "zenroom";
import devLog from "./devLog";
import base64url from "base64url";

//

export function formatZenObjects(o: Record<string, unknown>): string {
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

export async function createFileHash(file: File): Promise<string> {
  return base64url.fromBase64(await hashFile(await file.arrayBuffer()));
}

//

export async function hashFile(ab: ArrayBuffer): Promise<string> {
  const bytesChunkSize = 1024 * 64;
  let ctx = await zenroom_hash_init("sha512");
  if (ctx.logs) devLog("ERROR during hash");
  let i;
  for (i = 0; i < ab.byteLength; i += bytesChunkSize) {
    const upperLimit = i + bytesChunkSize > ab.byteLength ? ab.byteLength : i + bytesChunkSize;
    const i8a = new Uint8Array(ab.slice(i, upperLimit));
    ctx = await zenroom_hash_update(ctx.result, i8a);
  }
  ctx = await zenroom_hash_final(ctx.result);

  return ctx.result;
}

//

export async function createFileSignature(hash: string, eddsa: string): Promise<string> {
  const { result } = await zencode_exec(signFile(), {
    data: createZenData(hash),
    keys: createZenKeys(eddsa),
  });
  return await JSON.parse(result).eddsa_signature;
}

//

export async function prepFileForZenflows(file: File, eddsa: string): Promise<IFile> {
  const hash = await createFileHash(file);
  const signature = await createFileSignature(hash, eddsa);

  return {
    name: file.name,
    description: file.name,
    extension: file.name.split(".").at(-1) as string,
    hash,
    mimeType: file.type,
    size: file.size,
    signature,
  };
}

//

export async function prepFilesForZenflows(images: Array<File>, eddsa: string): Promise<Array<IFile>> {
  const prepImages: Array<IFile> = [];
  for (let i of images) {
    const image = await prepFileForZenflows(i, eddsa);
    prepImages.push(image);
  }
  return prepImages;
}

//

export async function uploadFile(file: File) {
  try {
    const hash = await createFileHash(file);

    const filesArray = new FormData();
    filesArray.append(hash, file);

    await fetch(process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL!, {
      method: "POST",
      body: filesArray,
    });
  } catch (e) {
    throw new Error("ImageUploadFail");
  }
}

export async function uploadFiles(files: Array<File>) {
  for (let f of files) {
    try {
      await uploadFile(f);
    } catch (e) {
      throw e;
    }
  }
}
