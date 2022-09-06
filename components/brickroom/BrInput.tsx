import React, {ChangeEventHandler, LegacyRef} from "react";
import {ExclamationIcon} from '@heroicons/react/solid'

type BrInputProps = {
    type?: 'number' | 'text' | 'password' | 'date' | 'email',
    value?: string,
    placeholder?: string,
    label?: string,
    onChange?: ChangeEventHandler,
    onBlur?: ChangeEventHandler,
    hint?: string,
    error?: string,
    className?: string,
    ref?: any,
}


const BrInput = (props: BrInputProps) => {

    return (<>

        <div className={`form-control ${props.className}`}>
            <label className="label">
                <span className="label-text">{props.label}</span>
            </label>
            <input type={props.type}
                   placeholder={props.placeholder}
                   onChange={props.onChange}
                   onBlur={props.onBlur}
                   className="w-full input input-bordered focus:input-primary"
                   value={props.value}
                   ref={props.ref}
            />
            <label className="label">
                {props.error &&
                <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                    {/* <ExclamationIcon className='w-5 h-5'/> */}
                    {props.error}</span>}
                {props.hint && <span className="label-text-alt">{props.hint}</span>}
            </label>
        </div>
    </>)
}

export default BrInput
