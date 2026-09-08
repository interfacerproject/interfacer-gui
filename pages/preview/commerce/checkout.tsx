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

import OrderSummary from "components/previewCommerce/OrderSummary";
import PreviewCommerceHeader from "components/previewCommerce/PreviewCommerceHeader";
import PreviewCommerceLayout from "components/previewCommerce/PreviewCommerceLayout";
import { PreviewPage } from "components/previewCommerce/ui";
import { useCommercePreview } from "lib/previewCommerce/cart";
import { previewCommerceGssp } from "lib/previewCommerce/gssp";
import { DELIVERY_METHODS, formatEur, MOCK_ADDRESS, MOCK_PRODUCT } from "lib/previewCommerce/mockData";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { CSSProperties, ReactElement, useEffect } from "react";

const PLACE_DELAY_MS = 1100;
const muted = "var(--ifr-text-secondary)";

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
  const {
    lines,
    totals,
    deliveryMethod,
    setDeliveryMethod,
    checkoutStep,
    setCheckoutStep,
    placing,
    setPlacing,
    resetCheckout,
  } = useCommercePreview();

  // Always land on the first step when arriving at checkout.
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

  const steps = [t("Address"), t("Delivery"), t("Payment")];
  const nextLabel =
    checkoutStep === 0
      ? t("Continue to delivery")
      : checkoutStep === 1
      ? t("Continue to payment")
      : placing
      ? t("Placing order…")
      : t("Place order");
  const backLabel =
    checkoutStep === 0 ? t("Back to cart") : checkoutStep === 1 ? t("Back to address") : t("Back to delivery");

  return (
    <PreviewPage
      header={
        <PreviewCommerceHeader
          eyebrow={t("BUY ON INTERFACER")}
          title={t("Checkout")}
          description={t("Complete your order from {{seller}}.", { seller: MOCK_PRODUCT.seller })}
        />
      }
    >
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {steps.map((label, i) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StepDot index={i} current={checkoutStep} />
            <span
              style={{
                fontSize: "14px",
                fontWeight: i === checkoutStep ? 600 : 400,
                color: i <= checkoutStep ? "var(--ifr-text-primary)" : "var(--ifr-text-muted)",
              }}
            >
              {label}
            </span>
            {i < steps.length - 1 && <span style={{ width: "40px", height: "1px", background: "#c9cccf" }} />}
          </div>
        ))}
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
          {checkoutStep === 1 && <DeliveryStep t={t} selected={deliveryMethod} onSelect={setDeliveryMethod} />}
          {checkoutStep === 2 && <PaymentStep t={t} />}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={goBack}
              style={{
                height: "44px",
                padding: "0 20px",
                border: "1px solid #c9cccf",
                borderRadius: "6px",
                background: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {backLabel}
            </button>
            <button
              type="button"
              onClick={goNext}
              style={{
                height: "44px",
                padding: "0 24px",
                border: "none",
                borderRadius: "6px",
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

        <OrderSummary
          lines={lines}
          totals={totals}
          shippingLabel={DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.title}
        />
      </div>
    </PreviewPage>
  );
};

function StepDot({ index, current }: { index: number; current: number }) {
  const done = index < current;
  const active = index === current;
  const bg = done || active ? "#036a53" : "#fff";
  const border = done || active ? "#036a53" : "#c9cccf";
  const color = done || active ? "#fff" : "var(--ifr-text-muted)";
  return (
    <span
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "9999px",
        border: `1px solid ${border}`,
        background: bg,
        color,
        display: "grid",
        placeItems: "center",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {done ? "✓" : index + 1}
    </span>
  );
}

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <h2 style={{ margin: 0, fontFamily: "var(--ifr-font-heading)", fontSize: "20px", fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: 0, fontSize: "13px", color: muted }}>{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  readOnly,
  span2,
}: {
  label: string;
  value?: string;
  placeholder?: string;
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
        color: muted,
        gridColumn: span2 ? "span 2" : undefined,
      }}
    >
      {label}
      <input defaultValue={value} placeholder={placeholder} readOnly={readOnly} style={inputStyle} />
    </label>
  );
}

function AddressStep({ t }: { t: TFn }) {
  return (
    <>
      <StepTitle title={t("Shipping address")} subtitle={t("Prefilled from your Interfacer profile.")} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Field label={t("Full name")} value={MOCK_ADDRESS.fullName} readOnly />
        <Field label={t("Email")} value={MOCK_ADDRESS.email} readOnly />
        <Field label={t("Street")} value={MOCK_ADDRESS.street} span2 />
        <Field label={t("City")} value={MOCK_ADDRESS.city} />
        <Field label={t("Postal code")} value={MOCK_ADDRESS.postalCode} />
        <Field label={t("Country")} value={MOCK_ADDRESS.country} span2 />
      </div>
    </>
  );
}

function DeliveryStep({
  t,
  selected,
  onSelect,
}: {
  t: TFn;
  selected: string;
  onSelect: (id: "standard" | "express") => void;
}) {
  return (
    <>
      <StepTitle title={t("Delivery")} subtitle={t("Choose how you want your order delivered.")} />
      <p style={{ margin: 0, fontSize: "12px", color: "var(--ifr-text-muted)" }}>
        {t("Ships from")} <span style={{ fontWeight: 500 }}>{MOCK_PRODUCT.shipsFrom}</span>
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {DELIVERY_METHODS.map(m => {
          const on = m.id === selected;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                textAlign: "left",
                cursor: "pointer",
                border: on ? "2px solid #036a53" : "1px solid #c9cccf",
                borderRadius: "6px",
                background: on ? "#f1f8f5" : "#fff",
              }}
            >
              <span
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "9999px",
                  border: on ? "5px solid #036a53" : "1px solid #c9cccf",
                  flex: "none",
                }}
              />
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "14px", fontWeight: 600 }}>{t(m.title)}</span>
                <span style={{ display: "block", fontSize: "12px", color: muted }}>{t(m.detail)}</span>
              </span>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>{formatEur(m.price)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function PaymentStep({ t }: { t: TFn }) {
  return (
    <>
      <StepTitle title={t("Payment")} subtitle={t("Complete your payment securely to place the order.")} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px",
          border: "2px solid #036a53",
          borderRadius: "6px",
          background: "#f1f8f5",
        }}
      >
        <span
          style={{ width: "16px", height: "16px", borderRadius: "9999px", border: "5px solid #036a53", flex: "none" }}
        />
        <span style={{ fontSize: "14px", fontWeight: 600 }}>{t("Credit or debit card")}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Field label={t("Cardholder name")} placeholder="Srfsh" />
        <Field label={t("Card number")} placeholder="1234 5678 9012 3456" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Field label={t("Expiry date")} placeholder="MM / YY" />
          <Field label={t("Security code")} placeholder="CVC" />
        </div>
      </div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          color: "var(--ifr-text-primary)",
        }}
      >
        <input type="checkbox" defaultChecked />
        {t("Billing address is the same as shipping address")}
      </label>
    </>
  );
}

CommercePreviewCheckout.publicPage = true;
CommercePreviewCheckout.getLayout = (page: ReactElement) => <PreviewCommerceLayout>{page}</PreviewCommerceLayout>;

export const getServerSideProps = previewCommerceGssp;

export default CommercePreviewCheckout;
