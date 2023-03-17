import { useAuth } from "hooks/useAuth";
import BrUserAvatar from "./brickroom/BrUserAvatar";

export default function TopbarUser() {
  const { user } = useAuth();

  return (
    <button className="w-12 h-12 rounded-full border-1 border-border-subdued flex items-center justify-center hover:border-primary hover:border-2">
      <div className="w-10 h-10">
        <BrUserAvatar name={user?.name} />
      </div>
    </button>
  );
}
