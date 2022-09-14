// @ts-ignore
import classNames from "classnames";
import Link from "next/link";
import React from "react";

type IfSideBarButtonProps = {
    text: string,
    link: string,
    active?: boolean,
    svg?: React.ReactNode;
    disabled?: boolean;
    w?: number | string;
    tag?: string | boolean;
}

const IfSideBarButton = ({ text, link, active = false, svg, disabled = false, w = 'full', tag=false }: IfSideBarButtonProps) => {
    const widthClass = `w-${w}`
    const linkClasses = classNames({
        'ml-4 gap-2 pl-0 btn btn-ghost font-medium normal-case rounded-lg border-2': true,
        'text-primary hover:bg-amber-200': !disabled,
        'mb-0.5 text-white btn-disabled border-0': disabled,
        'border-white': !active,
        'border-amber-200': active,
        [`${widthClass}`]: true,
    })
    const buttonClasses = classNames({
        'flex items-center items-center w-full pl-3 text-left': true,
    })

    const linkElement = (<a className={linkClasses}>
        <button className={buttonClasses} disabled={disabled}>
            <>
                <div className="flex items-center flex-1">
                    {svg}
                    {text}
                </div>
                {tag && <span className="inline-flex items-center justify-center px-1 py-0.5 text-xs rounded-lg font-display text-primary bg-accent">{tag}</span>}
            </>
        </button>
    </a>)

    return (<>
        {disabled ? linkElement : <Link href={link} passHref>{linkElement}</Link>}
    </>)
}
export default IfSideBarButton
