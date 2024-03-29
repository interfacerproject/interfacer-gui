// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import useSignedPost from "./useSignedPost";

type UseSocialReturnValue = {
  likeObject: (economicResource: string) => Promise<any>;
  isLiked: (economicResource: string) => boolean;
};

const useSocial = (economicResource?: string) => {
  const [likes, setLikes] = useState<string[]>([]);
  const [flag, setFlag] = useState<number>(0);
  const [userFollows, setUserFollows] = useState<string[]>([]);
  const [erFollows, setERFollows] = useState<string[]>([]);
  const { signedPost } = useSignedPost();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    getLikes();
    getUserFollows();
    if (!economicResource) return;
    getERFollows();
  }, [user, flag]);

  //provisional, to be updated as soon as inBox has implemented NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE}/${economicResource}/likes
  const getLikes = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}/liked`);
    const data = await response.json();
    var _likes: string[] = [];
    for (const item of data.data.items) {
      const _like = await fetch(item);
      const _likeData = await _like.json();
      _likes.push(_likeData.data.object.split("economicresource/")[1]);
    }
    setLikes(_likes);
  };

  const getERFollows = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE}/${economicResource}/follower`);
    const data = await response.json();
    setERFollows(data.data?.map((f: string) => f.split("person/")[1]));
    return data.data;
  };

  const getUserFollows = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}/following`);
    const data = await response.json();
    const followers = data.data?.map((f: string) => f.split("economicresource/")[1]);
    setUserFollows(followers);
    return data.data;
  };

  const likeER = async (): Promise<any> => {
    const data = new Date().toISOString();
    const request = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Like",
      actor: `${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}`,
      object: `${process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE}/${economicResource}`,
      published: data,
    };
    await signedPost(`${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}/outbox`, request);
    setFlag(flag + 1);
  };

  const followActivity = async (): Promise<any> => {
    const data = new Date().toISOString();
    const request = {
      "@context": "https://www.w3.org/ns/activitystreams",
      type: "Follow",
      actor: `${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}`,
      object: `${process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE}/${economicResource}`,
      published: data,
    };
    await signedPost(`${process.env.NEXT_PUBLIC_SOCIAL_PERSON}/${user!.ulid}/outbox`, request);
    setFlag(flag + 1);
  };

  const isLiked = (economicResource: string): boolean => likes?.includes(economicResource);
  const isFollowed = (): boolean => erFollows?.includes(user!.ulid);
  return {
    likeER,
    followActivity,
    isLiked,
    isWatched: isFollowed,
    getERFollows,
    getUserFollows,
    userFollows,
    erFollowerLength: erFollows?.length || 0,
  };
};

export default useSocial;
