import React from 'react';
import {BellIcon} from "@heroicons/react/outline";
import LocationMenu from "./LocationMenu";


function Topbar() {
    return (
        <div className="navbar bg-[#F3F3F1] px-2 pt-0 h-16 border-b border-primary">
            <div className="navbar-start">
                <label htmlFor="my-drawer" className= "btn btn-square btn-ghost drawer-button lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                             className="inline-block w-5 h-5 stroke-current">
                            <path d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                </label>
                <input type="text" placeholder="search.." className="input rounded-xl input-bordered w-128" disabled/>
            </div>
            <div className="navbar-center">
            </div>
            <div className="navbar-end">
                 <button className="mr-4 bg-white btn btn-circle btn-accent" disabled>
                     <BellIcon className="w-5 h-5"/>
                </button>
                <LocationMenu/>
            </div>
        </div>
    )
}

export default Topbar;
