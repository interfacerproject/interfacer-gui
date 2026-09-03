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

import {
  CenterToFit,
  Maximize,
  Minimize,
  RotateClockwise,
  RotateCounterclockwise,
  ZoomIn,
  ZoomOut,
} from "@carbon/icons-react";
import { useEffect, useRef, useState } from "react";

type StepModelViewerProps = {
  downloadUrl?: string;
  fileName?: string;
  modelUrl: string;
  height?: string;
  showControls?: boolean;
};

const StepModelViewer = ({
  downloadUrl,
  fileName,
  modelUrl,
  height = "min(72vh, 760px)",
  showControls = true,
}: StepModelViewerProps) => {
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<{ Destroy: () => void; Resize: () => void } | null>(null);
  const viewerInternalRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const viewerRootRef = useRef<HTMLDivElement | null>(null);

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
        viewerInternalRef.current = viewer.GetViewer();
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

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Resize viewer after fullscreen change
      setTimeout(() => viewerRef.current?.Resize(), 100);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    let cleanupResizeListener: (() => void) | undefined;
    setupViewer().then(cleanup => {
      cleanupResizeListener = cleanup;
    });

    return () => {
      isCancelled = true;
      window.clearInterval(loadingTimer);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      cleanupResizeListener?.();
      viewerRef.current?.Destroy();
      viewerRef.current = null;
      viewerInternalRef.current = null;
    };
  }, [modelUrl]);

  function getNav() {
    return viewerInternalRef.current?.navigation;
  }

  function handleZoomIn() {
    getNav()?.Zoom(0.15);
    viewerInternalRef.current?.Render();
  }

  function handleZoomOut() {
    getNav()?.Zoom(-0.15);
    viewerInternalRef.current?.Render();
  }

  function handleRotateLeft() {
    getNav()?.Orbit(20, 0);
    viewerInternalRef.current?.Render();
  }

  function handleRotateRight() {
    getNav()?.Orbit(-20, 0);
    viewerInternalRef.current?.Render();
  }

  function handleRotateUp() {
    getNav()?.Orbit(0, -20);
    viewerInternalRef.current?.Render();
  }

  function handleRotateDown() {
    getNav()?.Orbit(0, 20);
    viewerInternalRef.current?.Render();
  }

  function handleResetView() {
    const viewer = viewerInternalRef.current;
    if (!viewer) return;
    const boundingSphere = viewer.GetBoundingSphere(() => true);
    if (boundingSphere) {
      viewer.FitSphereToWindow(boundingSphere, true);
    }
  }

  function handleFullscreen() {
    if (!viewerRootRef.current) return;
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      viewerRootRef.current.requestFullscreen();
    }
  }

  const controlBtnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #d0ccc3",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#4a4740",
    transition: "background-color 0.15s, border-color 0.15s",
  };

  const controlBtnHoverStyle: React.CSSProperties = {
    backgroundColor: "#f0ede7",
    borderColor: "#b0ac9e",
  };

  return (
    <div ref={viewerRootRef} style={{ position: "relative" }}>
      {/* File header: name + download link */}
      {(fileName || downloadUrl) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "0.5rem",
          }}
        >
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

      {/* Error state — no viewer, just a well-formatted error card */}
      {error ? (
        <div
          style={{
            padding: "20px 24px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <p style={{ margin: 0, color: "#991b1b", fontWeight: 600, marginBottom: "8px" }}>
            {"Unable to preview this file"}
          </p>
          <p style={{ margin: 0, color: "#b91c1c", fontSize: "0.92rem" }}>{error}</p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "12px",
                color: "#036A53",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {"Download file instead"}
            </a>
          )}
        </div>
      ) : (
        <>
          {/* Loading status */}
          <p style={{ margin: "0 0 0.5rem 0", color: "#4a4740" }}>
            {isLoading ? `Importing model... ${elapsedSeconds}s` : "Model loaded."}
          </p>

          {isLoading && elapsedSeconds > 8 && (
            <p style={{ margin: "0 0 0.5rem 0", color: "#6a665d", fontSize: "0.95rem" }}>
              {"Large STEP files can take 20-90 seconds to parse in the browser, especially on first load."}
            </p>
          )}

          {/* Viewer container — hidden when errored */}
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
      )}

      {showControls && !isLoading && !error && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginTop: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            title="Zoom in"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleZoomIn}
          >
            <ZoomIn size={20} />
          </button>
          <button
            type="button"
            title="Zoom out"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleZoomOut}
          >
            <ZoomOut size={20} />
          </button>

          <span style={{ width: "1px", height: "24px", backgroundColor: "#d0ccc3", margin: "0 4px" }} />
          <button
            type="button"
            title="Rotate left"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleRotateLeft}
          >
            <RotateCounterclockwise size={20} />
          </button>
          <button
            type="button"
            title="Rotate right"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleRotateRight}
          >
            <RotateClockwise size={20} />
          </button>
          <button
            type="button"
            title="Rotate up"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleRotateUp}
          >
            <RotateClockwise size={20} style={{ transform: "rotate(-90deg)" }} />
          </button>
          <button
            type="button"
            title="Rotate down"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleRotateDown}
          >
            <RotateClockwise size={20} style={{ transform: "rotate(90deg)" }} />
          </button>

          <span style={{ width: "1px", height: "24px", backgroundColor: "#d0ccc3", margin: "0 4px" }} />
          <button
            type="button"
            title="Reset view"
            style={controlBtnStyle}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleResetView}
          >
            <CenterToFit size={20} />
          </button>

          <button
            type="button"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            style={{ ...controlBtnStyle, marginLeft: "auto" }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, controlBtnHoverStyle)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, controlBtnStyle)}
            onClick={handleFullscreen}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default StepModelViewer;
