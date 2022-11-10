import React from "react";
import Link from "next/link";
import Avatar from "boring-avatars";

const AvatarUsers = ({ users }: { users: Array<{ name: string; id: string }> }) => {
  return (
    <div className="avatar-group -space-x-6 h-20 w-32">
      {users?.map((u, i) => (
        <>
          {i < 4 && (
            <Link key={u?.id} href={`/profile/${u?.id}`}>
              <a>
                <div className="avatar">
                  <div className="w-9 hover:w-14">
                    <Avatar
                      size={"full"}
                      name={u.name}
                      variant="beam"
                      colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                    />
                    ;
                  </div>
                </div>
              </a>
            </Link>
          )}
        </>
      ))}
    </div>
  );
};
export default AvatarUsers;
