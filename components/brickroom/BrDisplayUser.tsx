import Avatar from "boring-avatars";
import Link from "next/link";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { useAuth } from "../../hooks/useAuth";

type BrDisplayUserProps = {
  id: string;
  name: string;
  location?: string;
};

const BrDisplayUser = (props: BrDisplayUserProps) => {
  const { user } = useAuth();
  return (
    <Link href={!!user ? `/profile/${props.id}` : "/sign_in"}>
      <a className="flex items-center pl-0">
        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
          <div className="w-12 rounded-full">
            <Avatar
              size={"full"}
              name={props.name}
              variant="beam"
              colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
            />
            ;
          </div>
        </label>
        <div className="ml-4">
          <h4 className="flex-auto">{props.name}</h4>
          {props.location && (
            <span className="flex items-center text-primary">
              <LocationMarkerIcon className="w-4 h-4 mr-1" />
              {props.location}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
};
export default BrDisplayUser;
