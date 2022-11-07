import { useTranslation } from "next-i18next";

export default function BrImageUploadEmptyState() {
  const { t } = useTranslation("BrImageUploadProps");

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-6">
      <svg
        aria-hidden="true"
        className="w-10 h-10 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      <p className="text-sm text-gray-500">
        <span className="font-semibold">{t("dragHereOrClick")}</span>
      </p>
    </div>
  );
}
