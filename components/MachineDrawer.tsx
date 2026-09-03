// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Close, Upload } from "@carbon/icons-react";
import { useAuth } from "hooks/useAuth";
import devLog from "lib/devLog";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";

const MACHINE_TYPES = [
  "3D Printer",
  "CNC Mill",
  "Laser Cutter",
  "PCB Mill",
  "Vinyl Cutter",
  "Embroidery Machine",
  "Soldering Iron",
  "Router",
  "Drill Press",
  "Band Saw",
  "Lathe",
  "Waterjet Cutter",
];

interface MachineDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

/** Right-hand collapsible drawer to quickly add machines, matching the DTEC prototype. */
export default function MachineDrawer({ open, onClose, onCreated }: MachineDrawerProps) {
  const { t } = useTranslation("common");
  const { user, client } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset when the drawer opens
  useEffect(() => {
    if (open) {
      setName("");
      setType("");
      setLocation("");
      setDescription("");
      setImageFile(null);
      setFeedback(null);
    }
  }, [open]);

  const isValid = name.trim().length > 0 && type.trim().length > 0;

  async function uploadImage(): Promise<string | undefined> {
    if (!imageFile || !client?.config.dppUrl) return undefined;
    try {
      const attachment = await client.files.uploadToDpp(imageFile);
      return `${client.config.dppUrl}/file/${encodeURIComponent(attachment.id)}`;
    } catch (e) {
      devLog("Machine image upload failed", e);
      return undefined;
    }
  }

  async function save(): Promise<boolean> {
    if (!client || !user || !isValid) return false;
    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      await client.resources.createMachine({
        name: name.trim(),
        type: type || undefined,
        location: location.trim() || undefined,
        note: description.trim(),
        image: imageUrl,
        metadata: { remote: false },
      });
      onCreated?.();
      return true;
    } catch (e) {
      devLog("Machine creation failed", e);
      setFeedback(t("Could not save the machine. Please try again."));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndAddAnother() {
    const ok = await save();
    if (ok) {
      setName("");
      setType("");
      setLocation("");
      setDescription("");
      setImageFile(null);
      setFeedback(t("Machine saved. Add another."));
    }
  }

  async function handleDone() {
    if (isValid) {
      const ok = await save();
      if (!ok) return;
    }
    onClose();
  }

  if (!open) return null;

  const labelStyle = {
    fontFamily: "var(--ifr-font-body)",
    fontSize: "var(--ifr-fs-sm)",
    fontWeight: "var(--ifr-fw-semibold)" as const,
    color: "var(--ifr-text-primary)",
  };
  const inputStyle = {
    height: "var(--ifr-control-height)",
    fontFamily: "var(--ifr-font-body)",
    fontSize: "var(--ifr-fs-base)",
  };
  const optionalLabel = `(${t("optional")})`;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 h-full bg-ifr-surface shadow-lg flex flex-col"
        style={{ width: "min(420px, 100vw)", borderLeft: "1px solid var(--ifr-border)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-ifr">
          <div>
            <h3
              className="text-ifr-text-primary m-0"
              style={{
                fontFamily: "var(--ifr-font-heading)",
                fontSize: "var(--ifr-fs-lg)",
                fontWeight: "var(--ifr-fw-bold)",
              }}
            >
              {t("Add machines")}
            </h3>
            <p
              className="text-ifr-text-secondary m-0 mt-1"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              {t("Save and keep adding — the form resets automatically")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="bg-transparent border-none p-1 cursor-pointer text-ifr-text-secondary hover:text-ifr-text-primary"
          >
            <Close size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>
              {t("Machine name")} <span style={{ color: "var(--ifr-green)" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t("e.g. Prusa i3 MK3S+")}
              className="w-full px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>
              {t("Type")} <span style={{ color: "var(--ifr-green)" }}>*</span>
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
              style={inputStyle}
            >
              <option value="">{t("Select a type…")}</option>
              {MACHINE_TYPES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>
              {t("Location")}{" "}
              <span className="text-ifr-text-secondary" style={{ fontWeight: 400 }}>
                {optionalLabel}
              </span>
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={t("e.g. FabLab Barcelona")}
              className="w-full px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>
              {t("Short description")}{" "}
              <span className="text-ifr-text-secondary" style={{ fontWeight: 400 }}>
                {optionalLabel}
              </span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t("Briefly describe the machine, its specs or intended use…")}
              rows={4}
              className="w-full px-3 py-2 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green resize-y"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
            />
            <p className="text-ifr-text-secondary m-0" style={{ fontSize: "var(--ifr-fs-xs)" }}>
              {t("This will appear in machine listings and service descriptions.")}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>
              {t("Image")}{" "}
              <span className="text-ifr-text-secondary" style={{ fontWeight: 400 }}>
                {optionalLabel}
              </span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setImageFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-ifr rounded-ifr-sm cursor-pointer hover:bg-ifr-hover transition-colors text-ifr-text-secondary"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
            >
              <Upload size={16} />
              {imageFile ? imageFile.name : t("Click to upload or drag & drop PNG, JPG, WEBP — max 10 MB")}
            </button>
          </div>

          {feedback && (
            <p
              className="m-0"
              style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)", color: "var(--ifr-green)" }}
            >
              {feedback}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ifr flex items-center gap-3">
          <button
            type="button"
            disabled={!isValid || saving}
            onClick={handleSaveAndAddAnother}
            className={`flex-1 px-4 py-2.5 border-none transition-opacity ${
              isValid && !saving ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              borderRadius: "var(--ifr-radius-sm)",
              backgroundColor: "var(--ifr-yellow)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
              color: "var(--ifr-text-primary)",
            }}
          >
            {saving ? t("Saving…") : t("Save & add another")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleDone}
            className="px-4 py-2.5 bg-transparent border border-ifr rounded-ifr-sm cursor-pointer hover:bg-ifr-hover transition-colors"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
              color: "var(--ifr-text-primary)",
            }}
          >
            {t("Done")}
          </button>
        </div>
      </div>
    </div>
  );
}
