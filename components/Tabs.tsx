import cn from "classnames";
import { ReactElement, useState } from "react";
type TabsProps = Array<{
  title: ReactElement | string;
  component: ReactElement<any, any>;
}>;

const Tabs = ({ tabsArray }: { tabsArray: TabsProps }) => {
  const [tab, setTab] = useState(0);

  return (
    <>
      <div className="tabs">
        {tabsArray.map((t, i) => (
          <a
            key={i}
            className={cn("tab tab-bordered pb-9", {
              "tab-active text-primary": i === tab,
            })}
            onClick={() => setTab(i)}
          >
            {t.title}
          </a>
        ))}
      </div>
      <div>{tabsArray[tab].component}</div>
    </>
  );
};
export default Tabs;
