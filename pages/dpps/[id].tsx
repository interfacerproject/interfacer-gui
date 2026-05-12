import {
  ArrowLeft,
  Checkmark,
  ChevronDown,
  ChevronUp,
  Download,
  Launch,
  OverflowMenuVertical,
  Share,
} from "@carbon/icons-react";
import Layout from "components/layout/Layout";
import useDppApi, { DppRequestError } from "lib/dpp";
import { generateDppPdf } from "lib/dpp-pdf";
import type { DppDocument } from "lib/dpp-types";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, first => first.toUpperCase());
}

function getFieldValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map(getFieldValue).filter(Boolean).join(", ") || null;
  }

  if (typeof value === "object") {
    const maybeTransformed = value as { value?: unknown; units?: unknown };
    if (Object.prototype.hasOwnProperty.call(maybeTransformed, "value")) {
      const scalar = getFieldValue(maybeTransformed.value);
      if (!scalar) return null;
      const units = typeof maybeTransformed.units === "string" ? maybeTransformed.units : null;
      return units ? `${scalar} ${units}` : scalar;
    }
  }

  return null;
}

function sectionFields(section: unknown): Array<{ label: string; value: string }> {
  if (!section || typeof section !== "object" || Array.isArray(section)) return [];

  return Object.entries(section)
    .map(([key, raw]) => {
      const value = getFieldValue(raw);
      if (!value) return null;
      return { label: prettifyKey(key), value };
    })
    .filter((field): field is { label: string; value: string } => field !== null);
}

const sectionConfig: Array<{ key: keyof DppDocument; title: string; subtitle: string; color: string }> = [
  {
    key: "productOverview",
    title: "DPP Overview",
    subtitle: "Basic product information and identification",
    color: "#E87C1E",
  },
  {
    key: "complianceAndStandards",
    title: "Compliance & Standards",
    subtitle: "Regulatory compliance information",
    color: "#2E7D32",
  },
  {
    key: "reparability",
    title: "Reparability",
    subtitle: "Repair instructions and spare parts availability",
    color: "#1565C0",
  },
  {
    key: "environmentalImpact",
    title: "Environmental Impact",
    subtitle: "Resource consumption and emissions data",
    color: "#558B2F",
  },
  {
    key: "certificates",
    title: "Certificates",
    subtitle: "Environmental and quality certifications",
    color: "#6A1B9A",
  },
  {
    key: "recyclability",
    title: "Recyclability",
    subtitle: "Material composition and recycling information",
    color: "#00838F",
  },
  {
    key: "energyUseAndEfficiency",
    title: "Energy Use & Efficiency",
    subtitle: "Battery and power specifications",
    color: "#EF6C00",
  },
  {
    key: "economicOperator",
    title: "Economic Operator",
    subtitle: "Manufacturer and company information",
    color: "#4E342E",
  },
  {
    key: "repairInformation",
    title: "Information about the Repair",
    subtitle: "Repair events and documentation",
    color: "#1565C0",
  },
  {
    key: "refurbishmentInformation",
    title: "Information about the Refurbishment",
    subtitle: "Refurbishment events and processes",
    color: "#00695C",
  },
  {
    key: "recyclingInformation",
    title: "Information on the Recycling",
    subtitle: "End-of-life recycling data",
    color: "#37474F",
  },
  {
    key: "consumerInformation",
    title: "Consumer Information",
    subtitle: "Product usage and safety details",
    color: "#AD1457",
  },
  {
    key: "dosageInstructions",
    title: "Dosage Instructions",
    subtitle: "Application and dosage guidance",
    color: "#C62828",
  },
  { key: "ingredients", title: "Ingredients", subtitle: "Ingredient and substance listing", color: "#283593" },
  { key: "packaging", title: "Packaging", subtitle: "Packaging materials and specifications", color: "#795548" },
];

const DppDetailPage: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const dppApi = useDppApi();
  const [dpp, setDpp] = useState<DppDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dppId = typeof router.query.id === "string" ? router.query.id : "";

  useEffect(() => {
    if (!router.isReady || !dppId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    dppApi
      .getDpp(dppId)
      .then(doc => {
        if (!cancelled) setDpp(doc);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof DppRequestError && err.status === 404) {
          setDpp(null);
          setError("not-found");
          return;
        }
        setError("generic");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dppApi, dppId, router.isReady]);

  const dppTitle = dpp?.productOverview?.productName?.value || dpp?.batchId || dpp?.id || dppId;
  const createdAt = dpp?.createdAt ? new Date(dpp.createdAt).toLocaleDateString() : "-";
  const parentProductLabel = dpp?.productId || t("Unknown product");
  const breadcrumbSeparator = "/";

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: dppTitle, text: t("Digital Product Passport"), url });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  };

  const onDownloadJson = () => {
    if (!dpp || typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(dpp, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${dpp.id}.json`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  const [pdfGenerating, setPdfGenerating] = useState(false);

  const onDownloadPdf = async () => {
    if (!dpp || typeof window === "undefined" || pdfGenerating) return;
    setPdfGenerating(true);
    try {
      generateDppPdf(dpp);
    } finally {
      setPdfGenerating(false);
    }
  };

  const sections = useMemo(() => {
    if (!dpp) return [];
    return sectionConfig
      .map(config => {
        const fields = sectionFields(dpp[config.key]);
        if (fields.length === 0) return null;
        return { key: String(config.key), title: config.title, subtitle: config.subtitle, color: config.color, fields };
      })
      .filter(Boolean) as Array<{
      key: string;
      title: string;
      subtitle: string;
      color: string;
      fields: Array<{ label: string; value: string }>;
    }>;
  }, [dpp]);

  const [dppInfoOpen, setDppInfoOpen] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const dppIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36V12.15l6-3.33v7.03l-6 3.33z"
        fill="#E87C1E"
      />
    </svg>
  );

  return (
    <div className="flex-1 bg-ifr-page" style={{ fontFamily: "var(--ifr-font-body)" }}>
      <div className="max-w-[1180px] mx-auto px-6 py-8 flex flex-col gap-6">
        <Link href="/products">
          <a className="inline-flex items-center gap-2 no-underline text-ifr-text-secondary hover:text-ifr-text-primary">
            <ArrowLeft size={16} />
            {t("Back")}
          </a>
        </Link>

        {loading && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-10 text-center text-ifr-text-secondary">
            {t("Loading DPP details...")}
          </div>
        )}

        {!loading && error === "not-found" && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-10 text-center">
            <h1
              className="m-0 text-ifr-text-primary"
              style={{ fontSize: "var(--ifr-fs-xl)", fontWeight: "var(--ifr-fw-bold)" }}
            >
              {t("DPP not found")}
            </h1>
            <p className="mt-3 mb-0 text-ifr-text-secondary">
              {t("This Digital Product Passport does not exist or is no longer available.")}
            </p>
          </div>
        )}

        {!loading && error === "generic" && (
          <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-10 text-center">
            <h1
              className="m-0 text-ifr-text-primary"
              style={{ fontSize: "var(--ifr-fs-xl)", fontWeight: "var(--ifr-fw-bold)" }}
            >
              {t("Unable to load DPP")}
            </h1>
            <p className="mt-3 mb-4 text-ifr-text-secondary">{t("An error occurred while loading the DPP details.")}</p>
            <button
              type="button"
              onClick={() => router.replace(router.asPath)}
              className="px-4 py-2 bg-ifr-yellow border-none rounded-ifr-sm cursor-pointer"
            >
              {t("Retry")}
            </button>
          </div>
        )}

        {!loading && !error && dpp && (
          <>
            {/* Breadcrumbs */}
            <nav className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-sm)" }}>
              <Link href="/products">
                <a className="text-ifr-text-secondary no-underline hover:underline">{t("Products")}</a>
              </Link>
              <span> {breadcrumbSeparator} </span>
              {dpp.productId ? (
                <Link href={`/project/${encodeURIComponent(dpp.productId)}`}>
                  <a className="text-ifr-text-secondary no-underline hover:underline">{parentProductLabel}</a>
                </Link>
              ) : (
                <span>{parentProductLabel}</span>
              )}
              <span> {breadcrumbSeparator} </span>
              <span className="text-ifr-text-primary">{dpp.id}</span>
            </nav>

            {/* Header card */}
            <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-6 flex flex-col gap-4">
              {/* Top row: label + actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {dppIcon}
                    <span
                      style={{ color: "#E87C1E", fontSize: "var(--ifr-fs-sm)", fontWeight: "var(--ifr-fw-medium)" }}
                    >
                      {t("Digital Product Passport")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className="m-0 text-ifr-text-primary"
                      style={{ fontSize: "var(--ifr-fs-2xl)", fontWeight: "var(--ifr-fw-bold)" }}
                    >
                      {dppTitle}
                    </h1>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5"
                      style={{
                        borderRadius: "999px",
                        backgroundColor: dpp.status === "active" ? "rgba(46,125,50,0.1)" : "rgba(3,106,83,0.1)",
                        color: dpp.status === "active" ? "#2E7D32" : "#036A53",
                        fontSize: "var(--ifr-fs-xs)",
                        fontWeight: "var(--ifr-fw-medium)",
                      }}
                    >
                      {dpp.status === "active" && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#2E7D32",
                            display: "inline-block",
                          }}
                        />
                      )}
                      {(dpp.status || "draft").charAt(0).toUpperCase() + (dpp.status || "draft").slice(1)}
                    </span>
                  </div>
                  {dpp.batchId && (
                    <div className="flex items-center gap-2" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                      <span className="text-ifr-text-secondary">{t("Batch") + ":"}</span>
                      <code
                        className="text-ifr-text-primary"
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "rgba(0,0,0,0.05)",
                          borderRadius: "var(--ifr-radius-sm)",
                          fontSize: "var(--ifr-fs-sm)",
                        }}
                      >
                        {dpp.batchId}
                      </code>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={onShare}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-ifr hover:bg-ifr-hover transition-colors cursor-pointer"
                    style={{ borderRadius: "var(--ifr-radius-sm)", fontSize: "var(--ifr-fs-sm)" }}
                  >
                    <Share size={16} />
                    {t("Share")}
                  </button>
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={pdfGenerating}
                    className="inline-flex items-center gap-2 px-4 py-2 border-none cursor-pointer transition-colors"
                    style={{
                      borderRadius: "var(--ifr-radius-sm)",
                      fontSize: "var(--ifr-fs-sm)",
                      backgroundColor: pdfGenerating ? "#c9a042" : "#E5B94E",
                      color: "#1a1a1a",
                      fontWeight: "var(--ifr-fw-medium)",
                      opacity: pdfGenerating ? 0.7 : 1,
                    }}
                  >
                    <Download size={16} />
                    {pdfGenerating ? t("Generating…") : t("Download PDF")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-9 h-9 bg-transparent border border-ifr hover:bg-ifr-hover transition-colors cursor-pointer"
                    style={{ borderRadius: "var(--ifr-radius-sm)" }}
                    aria-label={t("More actions")}
                  >
                    <OverflowMenuVertical size={16} />
                  </button>
                </div>
              </div>

              {/* Product link row */}
              <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-3"
                style={{ borderTop: "1px solid var(--ifr-border-color, #e0e0e0)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                    {t("Product") + ":"}
                  </span>
                  {dpp.productId ? (
                    <Link href={`/project/${encodeURIComponent(dpp.productId)}`}>
                      <a
                        className="inline-flex items-center gap-1 no-underline hover:underline"
                        style={{ color: "#1565C0" }}
                      >
                        <Launch size={14} />
                        {parentProductLabel}
                      </a>
                    </Link>
                  ) : (
                    <span className="text-ifr-text-primary">{t("Not linked")}</span>
                  )}
                </div>
                <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                  {t("Published")} {createdAt}
                </span>
              </div>
            </div>

            {/* "What is a DPP?" explainer card */}
            <div className="bg-ifr-surface border border-ifr rounded-ifr-md">
              <button
                type="button"
                onClick={() => setDppInfoOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-6 py-4 bg-transparent border-none cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  {dppIcon}
                  <span
                    className="text-ifr-text-primary"
                    style={{ fontSize: "var(--ifr-fs-lg)", fontWeight: "var(--ifr-fw-bold)" }}
                  >
                    {t("What is a Digital Product Passport?")}
                  </span>
                </div>
                {dppInfoOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {dppInfoOpen && (
                <div className="px-6 pb-5" style={{ fontSize: "var(--ifr-fs-sm)", lineHeight: 1.6 }}>
                  <p className="m-0 mb-3 text-ifr-text-secondary">
                    {t(
                      "A Digital Product Passport (DPP) is a structured digital record that travels with a product throughout its entire lifecycle — from manufacturing to end-of-life. It provides transparent, verifiable information about sustainability, compliance, repairability, and recyclability."
                    )}
                  </p>
                  <ul className="m-0 p-0 flex flex-col gap-2" style={{ listStyle: "none" }}>
                    {[
                      t("Traceability — records who made the product, where, and with what materials"),
                      t("Circularity support — enables repair, refurbishment, and responsible recycling"),
                      t("Regulatory compliance — documents CE marking, RoHS, and other certifications"),
                      t("Consumer transparency — gives buyers verified data on the product they purchased"),
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-ifr-text-secondary">
                        <Checkmark size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#2E7D32" }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Two-column: sections + sidebar */}
            <div className="flex gap-6 items-start">
              {/* Sections column */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                {sections.length === 0 ? (
                  <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-8 text-ifr-text-secondary">
                    {t("No section data available for this DPP.")}
                  </div>
                ) : (
                  sections.map(section => (
                    <div
                      key={section.key}
                      ref={el => {
                        sectionRefs.current[section.key] = el;
                      }}
                      className="bg-ifr-surface border border-ifr rounded-ifr-md"
                    >
                      {/* Section header with colored icon */}
                      <div
                        className="flex items-center gap-3 px-6 py-4"
                        style={{ borderBottom: "1px solid var(--ifr-border-color, #e0e0e0)" }}
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            backgroundColor: `${section.color}18`,
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36V12.15l6-3.33v7.03l-6 3.33z"
                              fill={section.color}
                            />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="m-0 text-ifr-text-primary"
                            style={{ fontSize: "var(--ifr-fs-base)", fontWeight: "var(--ifr-fw-bold)" }}
                          >
                            {t(section.title)}
                          </p>
                          <p className="m-0 text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                            {t(section.subtitle)}
                          </p>
                        </div>
                      </div>
                      {/* Section fields */}
                      <div className="grid gap-4 md:grid-cols-2 p-6">
                        {section.fields.map(field => (
                          <div key={`${section.key}-${field.label}`}>
                            <p className="m-0 text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                              {t(field.label)}
                            </p>
                            <p className="m-0 text-ifr-text-primary" style={{ fontSize: "var(--ifr-fs-base)" }}>
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar navigation (desktop only) */}
              {sections.length > 0 && (
                <div className="hidden lg:block w-[260px] flex-shrink-0 sticky top-8">
                  <div className="bg-ifr-surface border border-ifr rounded-ifr-md p-4 flex flex-col gap-1">
                    {sections.map(section => (
                      <button
                        key={section.key}
                        type="button"
                        onClick={() => scrollToSection(section.key)}
                        className="flex items-center gap-2.5 px-3 py-2 bg-transparent border-none cursor-pointer text-left rounded hover:bg-ifr-hover transition-colors w-full"
                        style={{ fontSize: "var(--ifr-fs-sm)" }}
                      >
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: `${section.color}18`,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 8.82l6 3.33v7.03l-6-3.33V8.82zm8 10.36V12.15l6-3.33v7.03l-6 3.33z"
                              fill={section.color}
                            />
                          </svg>
                        </div>
                        <span className="text-ifr-text-primary">{t(section.title)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

DppDetailPage.publicPage = true;

DppDetailPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout bottomPadding="none">{page}</Layout>;
};

export default DppDetailPage;
