import FocusTrap from "focus-trap-react";

export interface ScreenOverlayProps {
  children: React.ReactNode;
}

export default function ScreenOverlay({ children }: ScreenOverlayProps) {
  return (
    <FocusTrap>
      <div id="screen-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        {children}
        <button /> {/* Needed to avoid FocusTrap complaints */}
      </div>
    </FocusTrap>
  );
}
