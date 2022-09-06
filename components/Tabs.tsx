import {useState} from "react";
import React, {ReactElement} from 'react'

type TabsProps = Array<{
    title: string,
    component: ReactElement<any, any>
}>

const Tabs = ({tabsArray}: {tabsArray:TabsProps}) => {
    const [tab, setTab] = useState(0)
    const tabClass = (i:number)=> (i===tab)? "tab tab-bordered tab-active" : "tab tab-bordered"

    return (<>
        <div className="tabs">
            {tabsArray.map((t, i) =>
                <a key={i} className={tabClass(i)} onClick={() => setTab(i)}>
                    {t.title}
                </a>)}
        </div>
        <div>
            {tabsArray[tab].component}
        </div>
    </>)
};
export default Tabs;