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

import { useEffect, useRef, useState } from "react";

type StepModelViewerProps = {
  downloadUrl?: string;
  fileName?: string;
  modelUrl: string;
  height?: string;
};

const StepModelViewer = ({ downloadUrl, fileName, modelUrl, height = "min(72vh, 760px)" }: StepModelViewerProps) => {
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<{ Destroy: () => void; Resize: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;
    const loadingStart = Date.now();

    setIsLoading(true);
    setError(null);
    setElapsedSeconds(0);

    const loadingTimer = window.setInterval(() => {
      if (!isCancelled) {
        setElapsedSeconds(Math.floor((Date.now() - loadingStart) / 1000));
      }
    }, 1000);

    const setupViewer = async () => {
      if (!viewerContainerRef.current) {
        return;
      }

      try {
        const OV = await import("online-3d-viewer");
        if (isCancelled || !viewerContainerRef.current) {
          return;
        }

        const viewer = new OV.EmbeddedViewer(viewerContainerRef.current, {
          backgroundColor: new OV.RGBAColor(247, 247, 245, 255),
          defaultColor: new OV.RGBColor(186, 186, 186),
          // Edge extraction can add a noticeable CPU cost on large STEP files.
          edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(44, 44, 44), 15),
          onModelLoaded: () => {
            if (!isCancelled) {
              window.clearInterval(loadingTimer);
              setIsLoading(false);
            }
          },
          onModelLoadFailed: () => {
            if (!isCancelled) {
              window.clearInterval(loadingTimer);
              setError(`Model loading failed for ${modelUrl}.`);
              setIsLoading(false);
            }
          },
        });

        viewerRef.current = viewer;
        viewer.LoadModelFromUrlList([modelUrl]);

        const handleResize = () => {
          viewerRef.current?.Resize();
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch {
        if (!isCancelled) {
          window.clearInterval(loadingTimer);
          setError("Unable to initialize Online3DViewer.");
          setIsLoading(false);
        }
      }
    };

    let cleanupResizeListener: (() => void) | undefined;
    setupViewer().then(cleanup => {
      cleanupResizeListener = cleanup;
    });

    return () => {
      isCancelled = true;
      window.clearInterval(loadingTimer);
      cleanupResizeListener?.();
      viewerRef.current?.Destroy();
      viewerRef.current = null;
    };
  }, [modelUrl]);

  return (
    <>
      {(fileName || downloadUrl) && (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          {fileName ? <p style={{ margin: 0, color: "#2c2c2c", fontWeight: 600 }}>{fileName}</p> : <span />}
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#036A53", fontWeight: 600, textDecoration: "underline" }}
            >
              {"Open source file"}
            </a>
          )}
        </div>
      )}

      {error ? (
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <p style={{ margin: 0, color: "#a32e2e", fontWeight: 600 }}>{error}</p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#036A53", fontWeight: 600, textDecoration: "underline" }}
            >
              {"Download file"}
            </a>
          )}
        </div>
      ) : (
        <p style={{ margin: 0, color: "#4a4740" }}>
          {isLoading ? `Importing model... ${elapsedSeconds}s` : "Model loaded."}
        </p>
      )}

      {isLoading && elapsedSeconds > 8 && (
        <p style={{ margin: 0, color: "#6a665d", fontSize: "0.95rem" }}>
          {"Large STEP files can take 20-90 seconds to parse in the browser, especially on first load."}
        </p>
      )}

      <div
        ref={viewerContainerRef}
        style={{
          width: "100%",
          height: height,
          borderRadius: "18px",
          border: "1px solid #d0ccc3",
          boxShadow: "0 12px 40px rgba(76, 72, 61, 0.13)",
          background: "#f7f7f5",
          overflow: "hidden",
        }}
      />
    </>
  );
};

export default StepModelViewer;
