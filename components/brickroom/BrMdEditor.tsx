import dynamic from "next/dynamic";
import MdParser from "../../lib/MdParser";
import "react-markdown-editor-lite/lib/index.css";
import { ExclamationIcon } from "@heroicons/react/solid";
import React from "react";

type BrMdEditorProps = {
    className?: string;
    onChange?: ({ html, text }: { html: string; text: string }) => void;
    error?: string;
    hint?: string;
    label?: string;
    editorClass?: string;
    testID?: string;
};

const MdEditor = dynamic(
    async () => await import("react-markdown-editor-lite"),
    {
        ssr: false,
        suspense: true,
    }
);

const BrMdEditor = ({
    className,
    onChange,
    error,
    hint,
    label,
    editorClass,
    testID,
}: BrMdEditorProps) => {
    return (
        <div className={className}>
            <label className="label">
                <h4 className="label-text capitalize">{label}</h4>
            </label>
            <div data-test={testID}>
                <MdEditor
                    className={editorClass}
                    renderHTML={(text) => MdParser.render(text)}
                    onChange={onChange}
                />
            </div>
            <label className="label">
                {error && (
                    <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                        <ExclamationIcon className="w-5 h-5" />
                        {error}
                    </span>
                )}
                {hint && <span className="label-text-alt">{hint}</span>}
            </label>
        </div>
    );
};

export default BrMdEditor;
