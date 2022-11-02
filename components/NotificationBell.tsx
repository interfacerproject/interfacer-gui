import { BellIcon } from "@heroicons/react/outline";
import Link from "next/link";
import useInBox from "../hooks/useInBox";

const NotificationBell = () => {
  const { countUnread, hasNewMessages } = useInBox();
  return (
    <Link href="/notification">
      <a className="relative mr-4" id="notification-bell">
        <button className="bg-white btn btn-circle btn-accent">
          <BellIcon className={`w-5 h-5 ${hasNewMessages ? "animate-swing origin-top" : ""}`} />
        </button>
        {countUnread > 0 && (
          <sup className="absolute top-0 right-0 btn btn-active btn-circle btn-success btn-xs">{countUnread}</sup>
        )}
      </a>
    </Link>
  );
};

export default NotificationBell;
