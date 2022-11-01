import { BellIcon } from "@heroicons/react/outline";
import Link from "next/link";
import useInBox from "../hooks/useInBox";
import { useEffect, useState } from "react";

const NotificationBell = () => {
  const { countMessages } = useInBox();
  const [unreadLength, setUnreadLength] = useState(0);
  const [swinging, setSwinging] = useState(false);
  const count = async () => {
    const _count = await countMessages();
    if (_count.success) {
      return _count.count;
    }
  };
  useEffect(() => {
    setInterval(() => {
      const previousCounted = unreadLength;
      count().then(counted => {
        if (previousCounted < counted) {
          setSwinging(true);
          setUnreadLength(counted);
          setInterval(() => {
            setSwinging(false);
          }, 10000);
        }
      });
    }, 120000);
  }, []);
  return (
    <Link href="/notification">
      <a className="relative mr-4" id="notification-bell">
        <button className="bg-white btn btn-circle btn-accent">
          <BellIcon className={`w-5 h-5 ${swinging ? "animate-swing origin-top" : ""}`} />
        </button>
        {unreadLength > 0 && (
          <sup className="absolute top-0 right-0 btn btn-active btn-circle btn-success btn-xs">{unreadLength}</sup>
        )}
      </a>
    </Link>
  );
};

export default NotificationBell;
