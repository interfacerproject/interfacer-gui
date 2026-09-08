// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Close, LocationStar } from "@carbon/icons-react";
import { FetchLocation, fetchLocation, lookupLocation } from "lib/fetchLocation";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export default function LocationFilterSection() {
  const { t } = useTranslation("common");
  const router = useRouter();

  // --- Geo location state ---
  const urlRadius = router.query.nearDistanceKm ? Number(router.query.nearDistanceKm) : 50;
  const [searchRadius, setSearchRadius] = useState(urlRadius);
  const [locationLabel, setLocationLabel] = useState((router.query.locationLabel as string) || "");
  const [locationInput, setLocationInput] = useState("");
  const [locationOptions, setLocationOptions] = useState<FetchLocation.Location[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync location state from URL on mount / navigation
  useEffect(() => {
    const km = router.query.nearDistanceKm;
    if (km) setSearchRadius(Number(km));
    const label = router.query.locationLabel as string;
    if (label) setLocationLabel(label);
    else if (!router.query.nearLat) setLocationLabel("");
  }, [router.query.nearDistanceKm, router.query.locationLabel, router.query.nearLat]);

  // Debounced location search
  useEffect(() => {
    if (!locationInput.trim()) {
      setLocationOptions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true);
      const results = await fetchLocation(locationInput);
      setLocationOptions(results);
      setLocationLoading(false);
      setShowLocationDropdown(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [locationInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLocationSelect = useCallback(
    async (loc: FetchLocation.Location) => {
      setShowLocationDropdown(false);
      setLocationInput("");
      const detail =
        loc.position && Number.isFinite(loc.position.lat) && Number.isFinite(loc.position.lng)
          ? {
              title: loc.title,
              position: loc.position,
            }
          : await lookupLocation(loc.id);
      if (!detail) return;
      setLocationLabel(detail.title);
      const radius = router.query.nearDistanceKm ? String(router.query.nearDistanceKm) : "50";
      const query = {
        ...router.query,
        nearLat: String(detail.position.lat),
        nearLong: String(detail.position.lng),
        nearDistanceKm: radius,
        locationLabel: detail.title,
      };
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    },
    [router]
  );

  const handleRadiusChange = useCallback(
    (km: number) => {
      setSearchRadius(km);
      if (router.query.nearLat && router.query.nearLong) {
        const query = { ...router.query, nearDistanceKm: String(km) };
        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
      }
    },
    [router]
  );

  const clearLocation = useCallback(() => {
    setLocationLabel("");
    setLocationInput("");
    setSearchRadius(50);
    const query = { ...router.query };
    delete query.nearLat;
    delete query.nearLong;
    delete query.nearDistanceKm;
    delete query.locationLabel;
    router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [router]);

  return (
    <div className="flex flex-col gap-2" ref={locationDropdownRef}>
      {locationLabel ? (
        <div
          className="flex items-center gap-2 px-3 bg-ifr-active border border-ifr rounded-ifr-sm"
          style={{ height: "var(--ifr-control-height)" }}
        >
          <LocationStar size={14} className="text-ifr-green shrink-0" />
          <span
            className="flex-1 text-ifr-text-primary truncate"
            style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-base)" }}
          >
            {locationLabel}
          </span>
          <button
            type="button"
            onClick={clearLocation}
            className="shrink-0 text-ifr-text-secondary hover:text-ifr-text-primary cursor-pointer"
          >
            <Close size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            onFocus={() => locationOptions.length > 0 && setShowLocationDropdown(true)}
            placeholder={t("Search city or address...")}
            className="w-full px-3 bg-ifr-form-input border border-ifr-form-input rounded-ifr-sm outline-none focus:border-ifr-green"
            style={{
              height: "var(--ifr-control-height)",
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
            }}
          />
          {showLocationDropdown && locationOptions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-ifr-surface border border-ifr rounded-ifr-sm shadow-lg max-h-[200px] overflow-y-auto">
              {locationOptions.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-ifr-hover transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--ifr-font-body)", fontSize: "var(--ifr-fs-sm)" }}
                  onClick={() => handleLocationSelect(loc)}
                >
                  {loc.title}
                </button>
              ))}
            </div>
          )}
          {locationLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-ifr-green border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
      <label
        className="text-ifr-text-primary mt-2"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-sm)",
          fontWeight: "var(--ifr-fw-medium)",
        }}
      >
        {t("Search Radius")}
      </label>
      <div className="flex flex-wrap gap-2">
        {[10, 25, 50, 100, 250].map(km => (
          <button
            key={km}
            type="button"
            onClick={() => handleRadiusChange(km)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              searchRadius === km
                ? "bg-[#036a53] text-white"
                : "border border-[#c9cccf] text-[#0b1324] hover:bg-ifr-hover"
            }`}
          >
            {km}
            {t("km")}
          </button>
        ))}
      </div>
    </div>
  );
}
