import Avatar from "boring-avatars";
import { useAuth } from "hooks/useAuth";

export interface Props {
  name?: string;
  size?: number | string | undefined;
}

export default function BrUserAvatar(props: Props) {
  const { size = "full" } = props;
  const { user } = useAuth();

  if (user?.image) return <img className="w-full h-full" src={user.image} />;
  else
    return (
      <Avatar
        size={size}
        name={user!.name}
        variant="beam"
        colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
      />
    );
}
