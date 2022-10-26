import Avatar from "boring-avatars";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function LoginBtn() {
  const { logout, user } = useAuth();

  return (
    <>
      <div className="mt-1 btn btn-ghost btn-block text-primary w-60 hover:bg-transparent">
        <span className="flex flex-row items-center w-full pl-3 text-left">
          <div className="grid items-center grid-cols-2 p-2 pl-0">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar bordered border-accent">
              <div className="w-10 rounded-full">
                <Link href="/profile/my_profile">
                  <a>
                    <Avatar
                      size={"full"}
                      name={user?.username}
                      variant="beam"
                      colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                    />
                    ;
                  </a>
                </Link>
              </div>
            </label>
            <div className="grid grid-cols-1 ml-1 text-xs font-normal normal-case gap-y-1">
              <Link href="/profile/my_profile">
                <a>
                  <p className="text-base-400 whitespace-nowrap test-2xs">{user?.username}</p>
                </a>
              </Link>
              <button className="text-left hover:text-accent" onClick={() => logout()} data-test="signOut">
                Sign Out
              </button>
            </div>
          </div>
        </span>
      </div>
    </>
  );
}
