import React, {ChangeEventHandler} from "react";
import Link from "next/link";
// import {RefreshIcon} from "@heroicons/react/solid";

const CreateProjectButton = ({className, text}:{className?:string, text?:string}) => {

    const createProjectText = text? text : 'Create a new asset'

    return (<>
        <Link href="/create_project">
            <a className={`btn normal-case btn-accent ${className}`}>
                {createProjectText}
            </a>
        </Link>
    </>)
}

export default CreateProjectButton
