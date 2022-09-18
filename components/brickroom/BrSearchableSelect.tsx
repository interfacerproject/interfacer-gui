import AsyncSelect from 'react-select';
import {ExclamationIcon} from "@heroicons/react/solid";
import React from "react";

type AsyncSelectProps = {
    options: any[],
    onChange: (value: any) => void,
    onInputChange: (value: any) => void,
    value?: any,
    label?: string,
    placeholder?: string,
    hint?: string,
    error?: string,
    className?: string,
    inputValue?: string,
    help?: string,
    multiple?: boolean
}

const BrSearchableSelect = ({
                                onChange,
                                options,
                                onInputChange,
                                multiple=false,
                                inputValue,
                                value,
                                label,
                                placeholder,
                                hint,
                                error,
                                className,
                                help
                            }: AsyncSelectProps) => {
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            height: 48,
            border: state.isFocused ? '2px solid green' : 'blue',
        }),
    }

    return (<div className={`form-control ${className}`}>
        <label className="label">
            <h4 className="label-text">{label}</h4>
        </label>
        <AsyncSelect
            closeMenuOnSelect={!multiple}
            value={value}
            options={options}
            onChange={onChange}
            onInputChange={onInputChange}
            placeholder={placeholder}
            inputValue={inputValue}
            isSearchable
            className="border-primary"
            styles={customStyles}
            isMulti={multiple}
        />
        <label className="flex-col items-start label">
            {error &&
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                        <ExclamationIcon className='w-5 h-5'/>
                {error}
                    </span>
            }
            {hint && <span className="label-text-alt">{hint}</span>}
            {help && <p className="text-[#8A8E96]">{help}</p>}
        </label>
    </div>)

}

export default BrSearchableSelect
