import Avatar from "boring-avatars";

export interface Props {
  name?: string;
  size?: number | string | undefined;
}

export default function BrUserAvatar(props: Props) {
  const { name = "", size = "full" } = props;

  return (
    <Avatar size={size} name={name} variant="beam" colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]} />
  );
}
