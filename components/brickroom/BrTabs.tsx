import cn from "classnames";
import { ReactElement, useState } from "react";
type TabsProps = Array<{
  title: ReactElement | string;
  component: ReactElement<any, any>;
  disabled?: boolean;
}>;

const BrTabs = ({ tabsArray, initialTab = 0 }: { tabsArray: TabsProps; initialTab?: number }) => {
  const [tab, setTab] = useState(initialTab);

  return (
    <>
      <div className="tabs text-primary">
        {tabsArray.map((t, i) => (
          <a
            key={i}
            className={cn("tab tab-bordered pb-9", {
              "tab-active text-primary": i === tab,
              "tab-disabled": tabsArray[i].disabled,
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
export default BrTabs;
