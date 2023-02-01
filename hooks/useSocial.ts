import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import useSignedPost from "./useSignedPost";

type UseSocialReturnValue = {
  likeObject: (economicResource: string) => Promise<any>;
  isLiked: (economicResource: string) => boolean;
};

const useSocial = () => {
  const [likes, setLikes] = useState<string[]>([]);
  const [liked, setLiked] = useState<any>(null);
  const { signedPost } = useSignedPost();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    getLikes();
  }, [user, liked]);

  const getLikes = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SOCIAL}/${user!.ulid}/liked`);
    const data = await response.json();
    var _likes: string[] = [];
    for (const item of data.data.items) {
      const _like = await fetch(item);
      const _likeData = await _like.json();
      _likes.push(_likeData.data.object.split("economicresource/")[1].split("%")[0]);
    }
    setLikes(_likes);
  };

  const likeObject = async (economicResource: string): Promise<any> => {
    const data = new Date().toISOString();
    const request = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Like",
      actor: `${process.env.NEXT_PUBLIC_SOCIAL}/${user!.ulid}`,
      object: `${process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE}/${economicResource}}`,
      published: data,
    };
    const result = await signedPost(`${process.env.NEXT_PUBLIC_SOCIAL}/${user!.ulid}/outbox`, request);
    setLiked(result);
  };

  const isLiked = (economicResource: string): boolean => likes?.includes(economicResource);

  return {
    likeObject,
    isLiked,
  };
};

export default useSocial;
