import { NextPage } from 'next';
import React from 'react';
import useStorage from "../lib/useStorage";



const Logged_in: NextPage = () => {
    const {getItem, setItem} = useStorage()
    const username = getItem('authName', 'local')

    return (<>
        <h1>Hello {username}</h1>
        <h2>How do you arrive here? This app is still under construction!</h2>
        </>
    )
}
export default Logged_in;