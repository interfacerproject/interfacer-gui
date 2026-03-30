import { useQuery } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "hooks/useAuth";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import useDppApi from "lib/dpp";
import { UploadFileOnDPP } from "lib/fileUpload";
import { FETCH_RESOURCES } from "lib/QueryAndMutation";
import type { FetchInventoryQuery } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import LoadingOverlay from "components/LoadingOverlay";
import { CollapsibleSection } from "components/partials/create/project/steps/DPPStep/components";
import { dppStepSchema } from "components/partials/create/project/steps/DPPStep/schema";
import {
  CertificatesSection,
  ComplianceSection,
  ComponentInformationSection,
  EconomicOperatorSection,
  EnergyUseEfficiencySection,
  EnvironmentalSection,
  ProductOverviewSection,
  RecyclabilitySection,
  RecyclingInformationSection,
  RefurbishmentInformationSection,
  RepairabilitySection,
  RepairInformationSection,
} from "components/partials/create/project/steps/DPPStep/sections";
import type { DPPStepValues } from "components/partials/create/project/steps/DPPStep/types";
import type { BatchType } from "lib/dpp-types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CreateDppFormValues {
  batchType: BatchType;
  batchId: string;
  dpp: DPPStepValues;
}

// ─── Schema ─────────────────────────────────────────────────────────────────

const createDppSchema = () =>
  yup.object({
    batchType: yup.string().oneOf(["batch", "unit"]).required("Batch type is required"),
    batchId: yup.string().required("Batch/Serial ID is required"),
    dpp: dppStepSchema().required(),
  });

const defaultValues: CreateDppFormValues = {
  batchType: "batch",
  batchId: "",
  dpp: {} as DPPStepValues,
};

// ─── Nav Sections ───────────────────────────────────────────────────────────

interface DppNavSection {
  id: string;
  label: string;
}

const navSections: DppNavSection[] = [
  { id: "select-product", label: "Select product" },
  { id: "identification", label: "Identification" },
  { id: "product-overview", label: "Product Overview" },
  { id: "repairability", label: "Repairability" },
  { id: "environmentalImpact", label: "Environmental Impact" },
  { id: "compliance", label: "Compliance & Standards" },
  { id: "certificates", label: "Certificates" },
  { id: "recyclability", label: "Recyclability" },
  { id: "energy", label: "Energy Use & Efficiency" },
  { id: "component", label: "Component Information" },
  { id: "economic-operator", label: "Economic Operator" },
  { id: "repair-info", label: "Repair Information" },
  { id: "refurbishment-info", label: "Refurbishment Information" },
  { id: "recycling-info", label: "Recycling Information" },
];

// ─── Sidebar Nav ────────────────────────────────────────────────────────────

function CreateDppNav() {
  const { t } = useTranslation("createProjectProps");
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const section of navSections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav className="bg-ifr-surface border border-ifr rounded-ifr-md p-4 flex flex-col gap-1" aria-label={t("Sections")}>
      <p
        className="text-ifr-text-secondary m-0 mb-2 px-3"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-sm)",
          fontWeight: "var(--ifr-fw-semibold)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {t("Sections")}
      </p>
      {navSections.map(section => {
        const isActive = activeId === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className={`text-left px-3 py-2 border-none cursor-pointer transition-colors rounded-sm ${
              isActive ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
            }`}
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: isActive ? "var(--ifr-fw-semibold)" : "var(--ifr-fw-medium)",
              color: isActive ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)",
              borderRadius: "var(--ifr-radius-sm)",
            }}
          >
            {t(section.label)}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Main Form ──────────────────────────────────────────────────────────────

export default function CreateDppForm() {
  const { t } = useTranslation("createProjectProps");
  const router = useRouter();
  const { user } = useAuth();
  const dppApi = useDppApi();
  const [loading, setLoading] = useState(false);

  // Product selection
  const { specProjectProduct } = useResourceSpecs();
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const productFilter = useMemo(
    () => ({
      primaryAccountable: user?.ulid ? [user.ulid] : undefined,
      conformsTo: specProjectProduct?.id ? [specProjectProduct.id] : undefined,
    }),
    [user?.ulid, specProjectProduct?.id]
  );

  const { data: productsData } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
    variables: { last: 50, filter: productFilter },
    skip: !user?.ulid || !specProjectProduct?.id,
  });

  const userProducts = useMemo(() => {
    const edges = productsData?.economicResources?.edges ?? [];
    return edges
      .map(e => e.node)
      .filter(n => {
        if (!productSearch) return true;
        const q = productSearch.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q);
      });
  }, [productsData, productSearch]);

  // Close product dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Accordion states
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [repairabilityOpen, setRepairabilityOpen] = useState(false);
  const [environmentalOpen, setEnvironmentalOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [certificatesOpen, setCertificatesOpen] = useState(false);
  const [recyclabilityOpen, setRecyclabilityOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [componentOpen, setComponentOpen] = useState(false);
  const [economicOpen, setEconomicOpen] = useState(false);
  const [repairInfoOpen, setRepairInfoOpen] = useState(false);
  const [refurbishmentOpen, setRefurbishmentOpen] = useState(false);
  const [recyclingInfoOpen, setRecyclingInfoOpen] = useState(false);

  const formMethods = useForm<CreateDppFormValues>({
    mode: "all",
    resolver: yupResolver(createDppSchema()),
    defaultValues,
  });

  const { handleSubmit, register, watch, formState } = formMethods;
  const { isValid } = formState;
  const batchType = watch("batchType");

  // Process DPP values: upload Files to DPP backend, replace with URLs
  async function processDppValues(obj: any): Promise<any> {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof File) return UploadFileOnDPP(obj);
    if (Array.isArray(obj)) return Promise.all(obj.map(item => processDppValues(item)));
    if (typeof obj === "object") {
      const processed: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const val = await processDppValues(obj[key]);
          if (val && typeof val === "object" && "value" in val) {
            if (val.value === null || val.value === undefined) continue;
          }
          processed[key] = val;
        }
      }
      return processed;
    }
    return obj;
  }

  async function onSubmit(values: CreateDppFormValues) {
    setLoading(true);
    try {
      const processedDpp = await processDppValues(values.dpp);
      const response = await dppApi.createDpp({
        ...processedDpp,
        batchType: values.batchType,
        batchId: values.batchId,
        productId: selectedProduct?.id ?? "",
      });
      await router.push(`/profile/${user?.ulid}?tab=dpps`);
    } catch (err) {
      console.error("Failed to create DPP:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col min-h-screen bg-ifr-page" style={{ fontFamily: "var(--ifr-font-body)" }}>
          <div className="flex-1 flex flex-row justify-center gap-8 lg:gap-12 p-6 max-w-[1280px] mx-auto w-full">
            {/* Sidebar Nav */}
            <div className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-24">
                <CreateDppNav />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl pb-24">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
                  <h1
                    className="text-ifr-text-primary m-0 mb-2"
                    style={{
                      fontFamily: "var(--ifr-font-heading)",
                      fontSize: "var(--ifr-fs-2xl)",
                      fontWeight: "var(--ifr-fw-bold)",
                      lineHeight: "1.2",
                    }}
                  >
                    {t("Create Digital Product Passport")}
                  </h1>
                  <p
                    className="text-ifr-text-secondary m-0"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-md)",
                      lineHeight: "1.6",
                    }}
                  >
                    {t(
                      "Document the lifecycle, materials, and sustainability information of your product. Help consumers and regulators access transparent product data."
                    )}
                  </p>
                </div>

                {/* Select Product Section */}
                <div>
                  <div id="select-product" className="scroll-mt-24" />
                  <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2
                          className="text-ifr-text-primary m-0"
                          style={{
                            fontFamily: "var(--ifr-font-heading)",
                            fontSize: "var(--ifr-fs-lg)",
                            fontWeight: "var(--ifr-fw-semibold)",
                          }}
                        >
                          {t("Select product")} <span style={{ color: "var(--ifr-green)" }}>*</span>
                        </h2>
                        <p
                          className="text-ifr-text-secondary m-0 mt-1"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-base)",
                            lineHeight: "1.5",
                          }}
                        >
                          {t(
                            "A DPP must be linked to one of your published products. Select the product before filling in the passport data."
                          )}
                        </p>
                      </div>

                      {/* Selected product badge */}
                      {selectedProduct && (
                        <div
                          className="flex items-center gap-3 px-3 py-2.5 w-full"
                          style={{
                            borderRadius: "var(--ifr-radius-sm)",
                            border: "1px solid var(--ifr-green)",
                            backgroundColor: "var(--ifr-green-bg, rgba(16,185,129,0.08))",
                          }}
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span
                              className="text-ifr-text-primary"
                              style={{
                                fontFamily: "var(--ifr-font-body)",
                                fontSize: "var(--ifr-fs-base)",
                                fontWeight: "var(--ifr-fw-medium)",
                              }}
                            >
                              {selectedProduct.name}
                            </span>
                            <span
                              className="text-ifr-text-secondary"
                              style={{
                                fontFamily: "var(--ifr-font-body)",
                                fontSize: "var(--ifr-fs-sm)",
                              }}
                            >
                              {selectedProduct.id}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(null)}
                            className="flex items-center justify-center bg-transparent border-none cursor-pointer p-1 hover:opacity-70 transition-opacity shrink-0"
                            aria-label={t("Deselect product")}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Product search dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-ifr-text-primary"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-base)",
                            fontWeight: "var(--ifr-fw-medium)",
                          }}
                        >
                          {t("Product")} <span style={{ color: "var(--ifr-green)" }}>*</span>
                        </label>
                        <div className="relative" ref={dropdownRef}>
                          <div
                            className="flex items-center gap-2 w-full bg-transparent border border-ifr cursor-text"
                            style={{
                              height: "var(--ifr-control-height)",
                              borderRadius: "var(--ifr-radius-sm)",
                              padding: "0 12px",
                            }}
                            onClick={() => setProductDropdownOpen(true)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-ifr-text-secondary shrink-0"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                              type="text"
                              value={productSearch}
                              onChange={e => {
                                setProductSearch(e.target.value);
                                setProductDropdownOpen(true);
                              }}
                              placeholder={t("Search by product name or ID…")}
                              className="flex-1 bg-transparent border-none outline-none text-ifr-text-primary placeholder:text-ifr-text-secondary h-full"
                              style={{
                                fontFamily: "var(--ifr-font-body)",
                                fontSize: "var(--ifr-fs-base)",
                              }}
                              onFocus={() => setProductDropdownOpen(true)}
                            />
                          </div>
                          {productDropdownOpen && userProducts.length > 0 && (
                            <div
                              className="absolute z-50 w-full bg-ifr-surface mt-1 overflow-hidden max-h-[280px] overflow-y-auto border border-ifr"
                              style={{
                                borderRadius: "var(--ifr-radius-sm)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              }}
                            >
                              {userProducts.map(product => {
                                const isSelected = selectedProduct?.id === product.id;
                                return (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProduct({ id: product.id, name: product.name });
                                      setProductSearch("");
                                      setProductDropdownOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-2.5 border-none cursor-pointer text-left ${
                                      isSelected ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
                                    }`}
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <span
                                        className="text-ifr-text-primary"
                                        style={{
                                          fontFamily: "var(--ifr-font-body)",
                                          fontSize: "var(--ifr-fs-base)",
                                          fontWeight: "var(--ifr-fw-medium)",
                                        }}
                                      >
                                        {product.name}
                                      </span>
                                      <span
                                        className="text-ifr-text-secondary"
                                        style={{
                                          fontFamily: "var(--ifr-font-body)",
                                          fontSize: "var(--ifr-fs-sm)",
                                        }}
                                      >
                                        {product.id}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="var(--ifr-green)"
                                        strokeWidth="2"
                                        className="shrink-0"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <p
                          className="text-ifr-text-secondary m-0"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-sm)",
                          }}
                        >
                          {t(
                            "Only your published products are listed. A DPP cannot be created without a parent product."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div>
                  <div id="identification" className="scroll-mt-24" />
                  <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
                    <div className="flex flex-col gap-6">
                      <h2
                        className="text-ifr-text-primary m-0"
                        style={{
                          fontFamily: "var(--ifr-font-heading)",
                          fontSize: "var(--ifr-fs-lg)",
                          fontWeight: "var(--ifr-fw-semibold)",
                        }}
                      >
                        {t("Identification")}
                      </h2>

                      {/* Batch Type */}
                      <div className="flex flex-col gap-2">
                        <label
                          className="text-ifr-text-primary"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-base)",
                            fontWeight: "var(--ifr-fw-medium)",
                          }}
                        >
                          {t("Type")} <span style={{ color: "var(--ifr-green)" }}>*</span>
                        </label>
                        <div className="flex gap-3">
                          {(["batch", "unit"] as const).map(type => (
                            <label
                              key={type}
                              className={`flex items-center gap-2 px-4 cursor-pointer border transition-colors ${
                                batchType === type
                                  ? "border-ifr bg-ifr-hover"
                                  : "border-ifr bg-transparent hover:bg-ifr-hover/50"
                              }`}
                              style={{
                                height: "var(--ifr-control-height)",
                                borderRadius: "var(--ifr-radius-sm)",
                                fontFamily: "var(--ifr-font-body)",
                                fontSize: "var(--ifr-fs-base)",
                              }}
                            >
                              <input
                                type="radio"
                                value={type}
                                {...register("batchType")}
                                className="accent-[var(--ifr-green)]"
                              />
                              <span className="text-ifr-text-primary" style={{ fontWeight: "var(--ifr-fw-medium)" }}>
                                {type === "batch" ? t("Batch") : t("Single Unit")}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p
                          className="text-ifr-text-secondary m-0"
                          style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                        >
                          {batchType === "batch"
                            ? t("A DPP covering a batch of identical items (e.g., production run)")
                            : t("A DPP for a single, individually tracked item")}
                        </p>
                      </div>

                      {/* Batch / Serial ID */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="batchId"
                          className="text-ifr-text-primary"
                          style={{
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-base)",
                            fontWeight: "var(--ifr-fw-medium)",
                          }}
                        >
                          {batchType === "batch" ? t("Batch ID") : t("Serial Number")}{" "}
                          <span style={{ color: "var(--ifr-green)" }}>*</span>
                        </label>
                        <input
                          id="batchId"
                          type="text"
                          {...register("batchId")}
                          placeholder={batchType === "batch" ? "e.g., BATCH-2024-001" : "e.g., SN-123456"}
                          className="bg-transparent border border-ifr text-ifr-text-primary outline-none focus:border-[var(--ifr-green)] transition-colors"
                          style={{
                            height: "var(--ifr-control-height)",
                            borderRadius: "var(--ifr-radius-sm)",
                            padding: "0 12px",
                            fontFamily: "var(--ifr-font-body)",
                            fontSize: "var(--ifr-fs-base)",
                          }}
                        />
                        {formState.errors.batchId && (
                          <p className="text-red-500 m-0" style={{ fontSize: "var(--ifr-fs-sm)" }}>
                            {formState.errors.batchId.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DPP Sections */}
                <div>
                  <div className="bg-ifr-surface border border-ifr rounded-ifr-md py-8 px-8">
                    <div className="flex flex-col">
                      <div id="product-overview" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Product Overview")}
                        isOpen={overviewOpen}
                        onToggle={() => setOverviewOpen(!overviewOpen)}
                        id="product-overview-collapse"
                      >
                        <ProductOverviewSection />
                      </CollapsibleSection>

                      <div id="repairability" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Repairability")}
                        isOpen={repairabilityOpen}
                        onToggle={() => setRepairabilityOpen(!repairabilityOpen)}
                        id="repairability-collapse"
                      >
                        <RepairabilitySection />
                      </CollapsibleSection>

                      <div id="environmentalImpact" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Environmental Impact")}
                        isOpen={environmentalOpen}
                        onToggle={() => setEnvironmentalOpen(!environmentalOpen)}
                        id="environmental-collapse"
                      >
                        <EnvironmentalSection />
                      </CollapsibleSection>

                      <div id="compliance" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Compliance & Standards")}
                        isOpen={complianceOpen}
                        onToggle={() => setComplianceOpen(!complianceOpen)}
                        id="compliance-collapse"
                      >
                        <ComplianceSection />
                      </CollapsibleSection>

                      <div id="certificates" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Certificates")}
                        isOpen={certificatesOpen}
                        onToggle={() => setCertificatesOpen(!certificatesOpen)}
                        id="certificates-collapse"
                      >
                        <CertificatesSection />
                      </CollapsibleSection>

                      <div id="recyclability" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Recyclability")}
                        isOpen={recyclabilityOpen}
                        onToggle={() => setRecyclabilityOpen(!recyclabilityOpen)}
                        id="recyclability-collapse"
                      >
                        <RecyclabilitySection />
                      </CollapsibleSection>

                      <div id="energy" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Energy Use & Efficiency")}
                        isOpen={energyOpen}
                        onToggle={() => setEnergyOpen(!energyOpen)}
                        id="energy-collapse"
                      >
                        <EnergyUseEfficiencySection />
                      </CollapsibleSection>

                      <div id="component" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Component Information")}
                        isOpen={componentOpen}
                        onToggle={() => setComponentOpen(!componentOpen)}
                        id="component-collapse"
                      >
                        <ComponentInformationSection />
                      </CollapsibleSection>

                      <div id="economic-operator" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Economic Operator")}
                        isOpen={economicOpen}
                        onToggle={() => setEconomicOpen(!economicOpen)}
                        id="economic-collapse"
                      >
                        <EconomicOperatorSection />
                      </CollapsibleSection>

                      <div id="repair-info" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Repair Information")}
                        isOpen={repairInfoOpen}
                        onToggle={() => setRepairInfoOpen(!repairInfoOpen)}
                        id="repair-info-collapse"
                      >
                        <RepairInformationSection />
                      </CollapsibleSection>

                      <div id="refurbishment-info" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Refurbishment Information")}
                        isOpen={refurbishmentOpen}
                        onToggle={() => setRefurbishmentOpen(!refurbishmentOpen)}
                        id="refurbishment-collapse"
                      >
                        <RefurbishmentInformationSection />
                      </CollapsibleSection>

                      <div id="recycling-info" className="scroll-mt-24" />
                      <CollapsibleSection
                        title={t("Recycling Information")}
                        isOpen={recyclingInfoOpen}
                        onToggle={() => setRecyclingInfoOpen(!recyclingInfoOpen)}
                        id="recycling-collapse"
                      >
                        <RecyclingInformationSection />
                      </CollapsibleSection>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div
            className="sticky bottom-0 right-0 z-30 border-t border-ifr"
            style={{ backgroundColor: "var(--ifr-bg-surface)", fontFamily: "var(--ifr-font-body)" }}
          >
            <div className="max-w-[1280px] mx-auto flex flex-row items-center justify-end gap-3 px-6 py-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-ifr bg-transparent cursor-pointer text-ifr-text-secondary hover:bg-ifr-hover transition-colors"
                style={{
                  height: "var(--ifr-control-height)",
                  borderRadius: "var(--ifr-radius-sm)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-medium)",
                  padding: "0 20px",
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={!isValid || !selectedProduct}
                className="border-none cursor-pointer text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  height: "var(--ifr-control-height)",
                  borderRadius: "var(--ifr-radius-sm)",
                  backgroundColor: "var(--ifr-green)",
                  fontFamily: "var(--ifr-font-body)",
                  fontSize: "var(--ifr-fs-base)",
                  fontWeight: "var(--ifr-fw-semibold)",
                  padding: "0 24px",
                }}
              >
                {t("Create DPP")}
              </button>
            </div>
          </div>
        </div>
      </form>

      {loading && <LoadingOverlay />}
    </FormProvider>
  );
}
