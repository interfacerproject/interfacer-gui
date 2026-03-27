/**
 * API client for the interfacer-dpp REST backend.
 * Provides a React hook `useDppApi` with typed methods for all DPP operations.
 *
 * Auth: Signs requests with EdDSA keys via did-sign/did-pk headers
 * (same pattern as useSignedPost.ts signDidRequest).
 *
 * @see ~/dyne/interfacer-dpp/cmd/main/main.go for route definitions
 */

// @ts-ignore
import sign from "zenflows-crypto/src/sign_graphql.zen";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import type {
  Attachment,
  CreateDppResponse,
  DeleteDppResponse,
  DppApiError,
  DppDocument,
  DppStatus,
  ListDppsFilters,
  ListDppsResponse,
  UpdateDppResponse,
} from "./dpp-types";

const DPP_BASE_URL = process.env.NEXT_PUBLIC_DPP_URL;

class DppRequestError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "DppRequestError";
    this.status = status;
    this.details = details;
  }
}

export { DppRequestError };

const useDppApi = () => {
  const { getItem } = useStorage();
  const { user } = useAuth();

  async function signBody(body: string): Promise<{ "did-sign": string; "did-pk": string }> {
    const zencode_exec = (await import("zenroom")).zencode_exec;
    const data = `{"gql": "${Buffer.from(body, "utf8").toString("base64")}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsaPrivateKey")}"}}`;
    const { result } = await zencode_exec(sign, { data, keys });
    return {
      "did-sign": JSON.parse(result).eddsa_signature,
      "did-pk": String(user?.publicKey),
    };
  }

  async function request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${DPP_BASE_URL}${path}`;
    const jsonBody = body != null ? JSON.stringify(body) : undefined;

    const headers: Record<string, string> = {};

    if (jsonBody) {
      const authHeaders = await signBody(jsonBody);
      Object.assign(headers, authHeaders);
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, { method, headers, body: jsonBody });

    if (!res.ok) {
      let apiError: DppApiError = { error: res.statusText };
      try {
        apiError = await res.json();
      } catch {
        // response body may not be JSON
      }
      throw new DppRequestError(apiError.error, res.status, apiError.details);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // --- CRUD ---

  async function createDpp(data: Omit<DppDocument, "id">): Promise<CreateDppResponse> {
    return request<CreateDppResponse>("POST", "/dpp", data);
  }

  async function getDpp(id: string): Promise<DppDocument> {
    return request<DppDocument>("GET", `/dpp/${encodeURIComponent(id)}`);
  }

  async function updateDpp(id: string, data: Partial<DppDocument>): Promise<UpdateDppResponse> {
    return request<UpdateDppResponse>("PUT", `/dpp/${encodeURIComponent(id)}`, data);
  }

  async function deleteDpp(id: string): Promise<DeleteDppResponse> {
    return request<DeleteDppResponse>("DELETE", `/dpp/${encodeURIComponent(id)}`);
  }

  // --- List / Query ---

  async function listDpps(filters?: ListDppsFilters): Promise<ListDppsResponse> {
    const params = new URLSearchParams();
    if (filters?.productId) params.set("productId", filters.productId);
    if (filters?.createdBy) params.set("createdBy", filters.createdBy);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.limit != null) params.set("limit", String(filters.limit));
    if (filters?.offset != null) params.set("offset", String(filters.offset));

    const qs = params.toString();
    const path = qs ? `/dpps?${qs}` : "/dpps";

    return request<ListDppsResponse>("GET", path);
  }

  // --- File operations ---

  async function uploadFile(file: File): Promise<Attachment> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const zencode_exec = (await import("zenroom")).zencode_exec;
    const data = `{"gql": "${checksum}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsaPrivateKey")}"}}`;
    const { result } = await zencode_exec(sign, { data, keys });
    const signature = JSON.parse(result).eddsa_signature;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${DPP_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        "did-pk": String(user?.publicKey),
        "did-sign": signature,
      },
      body: formData,
    });

    if (!res.ok) {
      let apiError: DppApiError = { error: res.statusText };
      try {
        apiError = await res.json();
      } catch {}
      throw new DppRequestError(apiError.error, res.status, apiError.details);
    }

    return res.json();
  }

  function getFileUrl(id: string): string {
    return `${DPP_BASE_URL}/file/${encodeURIComponent(id)}`;
  }

  async function updateDppStatus(id: string, status: DppStatus): Promise<UpdateDppResponse> {
    return request<UpdateDppResponse>("PUT", `/dpp/${encodeURIComponent(id)}/status`, { status });
  }

  async function addAttachment(dppId: string, section: string, file: File): Promise<Attachment> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const zencode_exec = (await import("zenroom")).zencode_exec;
    const data = `{"gql": "${checksum}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsaPrivateKey")}"}}`;
    const { result } = await zencode_exec(sign, { data, keys });
    const signature = JSON.parse(result).eddsa_signature;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${DPP_BASE_URL}/dpp/${encodeURIComponent(dppId)}/attachments?section=${encodeURIComponent(section)}`,
      {
        method: "POST",
        headers: {
          "did-pk": String(user?.publicKey),
          "did-sign": signature,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      let apiError: DppApiError = { error: res.statusText };
      try {
        apiError = await res.json();
      } catch {}
      throw new DppRequestError(apiError.error, res.status, apiError.details);
    }

    return res.json();
  }

  async function deleteAttachment(dppId: string, attachmentId: string): Promise<void> {
    return request<void>("DELETE", `/dpp/${encodeURIComponent(dppId)}/attachments/${encodeURIComponent(attachmentId)}`);
  }

  return {
    createDpp,
    getDpp,
    updateDpp,
    deleteDpp,
    listDpps,
    uploadFile,
    getFileUrl,
    updateDppStatus,
    addAttachment,
    deleteAttachment,
  };
};

export default useDppApi;
