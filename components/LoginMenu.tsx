import Link from "next/link";
import {useAuth} from "../lib/auth";
import React from "react";
import Avatar from "boring-avatars";

export default function LoginBtn() {
    const {signOut, authUsername} = useAuth()

    return (
        <>
            <div className="mt-1 btn btn-ghost btn-block text-primary w-60 hover:bg-transparent">
            <span className="w-full text-left flex flex-row items-center pl-3">
                <div className="pl-0 grid grid-cols-2 p-2 items-center">
                     <label tabIndex={0} className="btn btn-ghost btn-circle avatar bordered border-accent">
                        <div className="w-10 rounded-full">
                            <Avatar
                                size={'full'}
                                name={authUsername}
                                variant="beam"
                                colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                            />;
                        </div>
                    </label>
                    <div className="ml-1 grid grid-cols-1 text-xs font-normal normal-case gap-y-1">
                        <Link href="/profile/my_profile"><a><p className="text-base-400 whitespace-nowrap test-2xs">{authUsername}</p></a></Link>
                        <button className="hover:text-accent text-left" onClick={() => signOut()}>Sign Out</button>
                    </div>

                </div>
            </span>

            </div>
        </>
    )
}
