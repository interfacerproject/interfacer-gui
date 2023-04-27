import { gql, useQuery } from "@apollo/client";
import Avatar from "boring-avatars";
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

  const { data, loading } = useQuery<GetUserImagesQuery, GetUserImagesQueryVariables>(GET_USER_IMAGES, {
    variables: { userId: userId! },
    skip: !userId,
  });

  let u: Partial<PersonWithFileEssential> | null = null;
  if (user) u = user;
  else if (userId && data?.person) u = data?.person;

  if (!u) return <AvatarContainer size={size} />;

  const img = getUserImage(u);

  if (loading) return <AvatarContainer size={size} />;

  return (
    <AvatarContainer size={size}>
      {img && <img className="w-full h-full object-cover" src={img} />}
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

export const GET_USER_IMAGES = gql`
  query GetUserImages($userId: ID!) {
    person(id: $userId) {
      id
      name
      images {
        bin
        mimeType
        date
        description
        extension
        hash
        name
        size
      }
    }
  }
`;
