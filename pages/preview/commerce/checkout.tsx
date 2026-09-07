// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { ShieldGlyph } from "components/previewCommerce/glyphs";
import OrderSummary from "components/previewCommerce/OrderSummary";
import PreviewBadge from "components/previewCommerce/PreviewBadge";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { PreviewHeading } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { formatEur, MOCK_ADDRESS, MOCK_CARD, MOCK_DELIVERY_OPTIONS } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement, ReactNode, useEffect } from "react";

const PLACE_DELAY_MS = 1100;

function stepPillStyle(state: "current" | "done" | "todo"): CSSProperties {
  const base: CSSProperties = {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "center",
  };
  if (state === "current") return { ...base, background: "#036a53", color: "#fff" };
  if (state === "done")
    return { ...base, background: "#f1f8f5", color: "#036a53", border: "1px solid rgba(3,106,83,0.2)" };
  return { ...base, background: "#fff", color: "var(--ifr-text-secondary)", border: "1px solid #c9cccf" };
}

const inputStyle: CSSProperties = {
  height: "40px",
  padding: "0 12px",
  border: "1px solid #cacccf",
  borderRadius: "6px",
  background: "#fafbfb",
  fontSize: "14px",
  color: "var(--ifr-text-primary)",
  width: "100%",
};

const CommercePreviewCheckout: NextPageWithLayout = () => {
  const { t } = useTranslation("commercePreviewProps");
  const router = useRouter();
  const { lines, totals, checkoutStep, setCheckoutStep, placing, setPlacing, resetCheckout } = useCommercePreview();

  // Always land on step 1 when arriving at checkout.
  useEffect(() => {
    resetCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    if (checkoutStep === 0) router.push("/preview/commerce/cart");
    else setCheckoutStep((checkoutStep - 1) as 0 | 1);
  };

  const goNext = () => {
    if (checkoutStep < 2) {
      setCheckoutStep((checkoutStep + 1) as 1 | 2);
      return;
    }
    if (placing) return;
    setPlacing(true);
    window.setTimeout(() => {
      setPlacing(false);
      router.push("/preview/commerce/order");
    }, PLACE_DELAY_MS);
  };

  const nextLabel = placing
    ? t("Placing order…")
    : checkoutStep === 2
    ? t("Pay {{total}}", { total: formatEur(totals.total) })
    : t("Continue");

  return (
    <main
      style={{ maxWidth: "1080px", margin: "0 auto", padding: "24px 24px 120px", fontFamily: "var(--ifr-font-body)" }}
    >
      <PreviewHeading style={{ marginBottom: "20px" }}>{t("Checkout")}</PreviewHeading>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={stepPillStyle(checkoutStep === 0 ? "current" : "done")}>{t("1 Address")}</div>
        <div style={stepPillStyle(checkoutStep === 1 ? "current" : checkoutStep > 1 ? "done" : "todo")}>
          {t("2 Delivery")}
        </div>
        <div style={stepPillStyle(checkoutStep === 2 ? "current" : "todo")}>{t("3 Payment")}</div>
      </div>

      <div
        className="ifr-pc-collapse"
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: "24px", alignItems: "start" }}
      >
        <div
          style={{
            border: "1px solid #c9cccf",
            borderRadius: "6px",
            background: "#fff",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {checkoutStep === 0 && <AddressStep t={t} />}
          {checkoutStep === 1 && <DeliveryStep t={t} />}
          {checkoutStep === 2 && <PaymentStep t={t} />}

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={goBack}
              style={{
                height: "44px",
                padding: "0 20px",
                border: "1px solid #c9cccf",
                borderRadius: "8px",
                background: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t("Back")}
            </button>
            <button
              type="button"
              onClick={goNext}
              style={{
                height: "44px",
                padding: "0 24px",
                border: "none",
                borderRadius: "8px",
                background: "#036a53",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {placing && (
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "9999px",
                    animation: "ifr-preview-spin 0.7s linear infinite",
                    display: "block",
                  }}
                />
              )}
              {nextLabel}
            </button>
          </div>
        </div>

        <OrderSummary lines={lines} totals={totals} />
      </div>
    </main>
  );
};

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function StepTitle({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>{children}</h2>
  );
}

function Field({
  label,
  value,
  readOnly,
  span2,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  span2?: boolean;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        fontSize: "12px",
        color: "var(--ifr-text-secondary)",
        gridColumn: span2 ? "span 2" : undefined,
      }}
    >
      {label}
      <input defaultValue={value} readOnly={readOnly} style={inputStyle} />
    </label>
  );
}

function AddressStep({ t }: { t: TFn }) {
  return (
    <>
      <StepTitle>{t("Shipping address")}</StepTitle>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--ifr-text-secondary)" }}>
        {t("Prefilled from your Interfacer profile.")}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label={t("Full name")} value={MOCK_ADDRESS.fullName} readOnly />
        <Field label={t("Email")} value={MOCK_ADDRESS.email} readOnly />
        <Field label={t("Street")} value={MOCK_ADDRESS.street} span2 />
        <Field label={t("City")} value={MOCK_ADDRESS.city} />
        <Field label={t("Postal code")} value={MOCK_ADDRESS.postalCode} />
      </div>
    </>
  );
}

function DeliveryStep({ t }: { t: TFn }) {
  return (
    <>
      <StepTitle>{t("Delivery")}</StepTitle>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--ifr-text-secondary)" }}>
        {t("One choice per seller — the service item needs no shipping.")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {MOCK_DELIVERY_OPTIONS.map((o, i) => {
          const selected = i === 0;
          if (!o.selectable) {
            return (
              <div
                key={o.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  border: "1px solid #c9cccf",
                  borderRadius: "6px",
                  background: "#fafbfb",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{t(o.title)}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>
                    {t(o.detail)}
                  </p>
                </div>
                <span style={{ fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(o.price)}</span>
              </div>
            );
          }
          return (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                border: selected ? "2px solid #036a53" : "1px solid #c9cccf",
                borderRadius: "6px",
                background: selected ? "#f1f8f5" : "#fff",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "9999px",
                  border: selected ? "5px solid #036a53" : "1px solid #c9cccf",
                  flex: "none",
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{t(o.title)}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--ifr-text-secondary)" }}>{t(o.detail)}</p>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{o.price}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function PaymentStep({ t }: { t: TFn }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <StepTitle>{t("Payment")}</StepTitle>
        <PreviewBadge kind="mockPayment" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "420px" }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "12px",
            color: "var(--ifr-text-secondary)",
          }}
        >
          {t("Card number")}
          <input
            defaultValue={MOCK_CARD.number}
            style={{ ...inputStyle, height: "44px", fontSize: "15px", letterSpacing: "0.5px" }}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "12px",
              color: "var(--ifr-text-secondary)",
            }}
          >
            {t("Expiry")}
            <input defaultValue={MOCK_CARD.expiry} style={{ ...inputStyle, height: "44px", fontSize: "15px" }} />
          </label>
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "12px",
              color: "var(--ifr-text-secondary)",
            }}
          >
            {t("CVC")}
            <input defaultValue={MOCK_CARD.cvc} style={{ ...inputStyle, height: "44px", fontSize: "15px" }} />
          </label>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "12px 14px",
            border: "1px solid #c9cccf",
            borderRadius: "6px",
            background: "rgba(200,212,229,0.15)",
          }}
        >
          <ShieldGlyph size={16} stroke="#036a53" />
          <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5, color: "var(--ifr-text-secondary)" }}>
            {t(
              "Card data never touches Interfacer. Medusa creates one payment intent and splits the payout between the two sellers."
            )}
          </p>
        </div>
      </div>
    </>
  );
}

CommercePreviewCheckout.publicPage = true;
CommercePreviewCheckout.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewCheckout;
