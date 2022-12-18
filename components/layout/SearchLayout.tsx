import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

type layoutProps = {
  children: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { authenticated } = useAuth();
  const router = useRouter();

  // Closes sidebar automatically when route changes
  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      setIsSidebarOpen(false);
    });
  }, [router.events]);

  return (
    <>
      {authenticated ? (
        <div className="drawer">
          <input
            id="my-drawer"
            type="checkbox"
            className="drawer-toggle"
            onChange={() => setIsSidebarOpen(!isSidebarOpen)}
            checked={isSidebarOpen}
          />
          <div className="drawer-content">
            <Topbar search={false} />
            <div className="bg-[#F3F3F1] min-h-screen max-w-full md:pl-10">{layoutProps?.children}</div>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" className="drawer-overlay" />
            <Sidebar closed={!isSidebarOpen} setIsClosed={c => setIsSidebarOpen(!c)} />
          </div>
        </div>
      ) : (
        <div className="bg-[#F3F3F1] min-h-screen">{layoutProps?.children}</div>
      )}
    </>
  );
};

export default Layout;
