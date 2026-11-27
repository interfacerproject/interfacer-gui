import { useQuery } from "lib/apollo-compat";
import { GET_USER_IMAGES } from "@dyne/interfacer-client";
import Avatar from "boring-avatars";
import { useAuth } from "hooks/useAuth";
import { getUserImage } from "lib/resourceImages";
import { GetUserImagesQuery, GetUserImagesQueryVariables } from "lib/types";
import { PersonWithFileEssential } from "lib/types/extensions";

export interface Props {
  user?: Partial<PersonWithFileEssential>;
  userId?: string;
  size?: string;
}

export default function BrUserAvatar(props: Props) {
  const { user, userId, size = "100%" } = props;
  const { authenticated } = useAuth();

  // A person handed over without their pictures' contents (a card's author
  // comes with id, name and images' mimeType only) is looked up by id, so the
  // avatar is their picture, not a generated one.
  const lookupId = userId ?? (user && !user.images?.some(i => !!i?.bin) ? user.id : undefined);
  const { data, loading } = useQuery<GetUserImagesQuery, GetUserImagesQueryVariables>(GET_USER_IMAGES, {
    variables: { userId: lookupId! },
    skip: !lookupId || !authenticated,
  });

  let u: Partial<PersonWithFileEssential> | null = null;
  if (user) u = data?.person ? { ...user, images: data.person.images } : user;
  else if (userId && data?.person) u = data?.person;

  if (!u) return <AvatarContainer size={size} />;

  const img = getUserImage(u);

  if (loading) return <AvatarContainer size={size} />;

  return (
    <AvatarContainer size={size}>
      {img && <img className="w-full h-full object-cover" src={img} alt="" />}
      {!img && (
        <Avatar
          size="full"
          name={u!.name}
          variant="beam"
          colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
        />
      )}
    </AvatarContainer>
  );
}

function AvatarContainer(props: { size: string; children?: React.ReactNode }) {
  const { size, children } = props;
  return (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden bg-gray-200">
      {children}
    </div>
  );
}
