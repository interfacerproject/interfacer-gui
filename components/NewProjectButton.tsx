import React, {ChangeEventHandler} from "react";
import Link from "next/link";
// import {RefreshIcon} from "@heroicons/react/solid";

const CreateProjectButton = () => {

    const createProjectText = 'Create a new asset'

    return (<>
        <Link href="/create_project">
            <a className="btn font-medium normal-case btn-primary w-60 ml-4">
                {createProjectText}
            </a>
        </Link>
    </>)
}

export default CreateProjectButton
