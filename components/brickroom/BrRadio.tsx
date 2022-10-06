import React, { ChangeEvent } from "react";
import { ExclamationIcon } from "@heroicons/react/solid";

type BrRadioProps = {
    array: Array<{ id: string; name: string; value: string; label: string }>;
    label: string;
    value?: string;
    onChange: (value: string) => void;
    hint?: string;
    error?: string;
    checked?: boolean;
    testID?: string;
};

const BrRadio = (props: BrRadioProps) => {
    return (
        <>
            <div className="form-control">
                <label className="label">
                    <h4 className="label-text capitalize">{props.label}</h4>
                </label>
                {props.array.map(
                    (unit: {
                        id: string;
                        name: string;
                        value: string;
                        label: string;
                    }) => (
                        <label
                            key={unit?.id}
                            className={`label cursor-pointer flex ${
                                props.value === unit.value
                                    ? "bg-green-100 border border-green-400 rounded"
                                    : ""
                            }`}
                        >
                            <input
                                type="radio"
                                className="radio checked:bg-primary"
                                name={unit.name}
                                value={unit.value}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    props.onChange(e.target.value)
                                }
                                checked={props.value === unit.value}
                                data-testID={props.testID}
                            />
                            <div className="flex-auto ml-5">
                                <h4
                                    className={`label-text ${
                                        props.value === unit.value
                                            ? "text-primary mb-0"
                                            : "mb-0"
                                    }`}
                                >
                                    {unit.name}
                                </h4>
                                <span
                                    className={`label-text ${
                                        props.value === unit.value
                                            ? "text-primary"
                                            : ""
                                    }`}
                                >
                                    {unit.label}
                                </span>
                            </div>
                        </label>
                    )
                )}
                <label className="label">
                    {props.error && (
                        <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                            <ExclamationIcon className="w-5 h-5" />
                            {props.error}
                        </span>
                    )}
                    {props.hint && (
                        <span className="label-text-alt">{props.hint}</span>
                    )}
                </label>
            </div>
        </>
    );
};

export default BrRadio;
