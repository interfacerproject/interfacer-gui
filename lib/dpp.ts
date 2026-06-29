/**
 * DPP API client — delegates to @interfacer/client SDK.
 */
import { useAuth } from "hooks/useAuth";

export class DppRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "DppRequestError";
  }
}

const useDppApi = () => {
  const { client } = useAuth();

  return {
    createDpp: (data: any) => client?.dpp.createDpp(data) ?? Promise.reject(new Error("Not authenticated")),
    getDpp: (id: string) => client?.dpp.getDpp(id) ?? Promise.reject(new Error("Not authenticated")),
    updateDpp: (id: string, data: any) =>
      client?.dpp.updateDpp(id, data) ?? Promise.reject(new Error("Not authenticated")),
    deleteDpp: (id: string) => client?.dpp.deleteDpp(id) ?? Promise.reject(new Error("Not authenticated")),
    listDpps: (filters?: any) => client?.dpp.listDpps(filters) ?? Promise.reject(new Error("Not authenticated")),
    uploadFile: (file: File) => client?.files.uploadToDpp(file) ?? Promise.reject(new Error("Not authenticated")),
    getFileUrl: (id: string) => client?.dpp.getFileUrl(id) ?? "",
    getQrCodeUrl: (dppId: string, size?: number) => client?.dpp.getQrCodeUrl(dppId, size) ?? "",
    updateDppStatus: (id: string, status: string) =>
      client?.dpp.updateDppStatus(id, status as any) ?? Promise.reject(new Error("Not authenticated")),
    addAttachment: (dppId: string, section: string, file: File) =>
      client?.dpp.addAttachment(dppId, section, file) ?? Promise.reject(new Error("Not authenticated")),
    deleteAttachment: (dppId: string, attachmentId: string) =>
      client?.dpp.deleteAttachment(dppId, attachmentId) ?? Promise.reject(new Error("Not authenticated")),
  };
};

export default useDppApi;
