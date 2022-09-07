import React from 'react';
import Link from "next/link";
import Avatar from "boring-avatars";

const AvatarUsers = ({users}: { users: Array<{ displayUsername: string, id: string }> }) => {
    const pruneDuplicates: (u: { displayUsername: string, id: string }[]) => { displayUsername: string, id: string }[] = (u: Array<{ displayUsername: string, id: string }>) => {
        return u.filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.id === value.id && t.displayUsername === value.displayUsername
                ))
        )}
        return <div className="avatar-group -space-x-6 h-20 w-32">
            {pruneDuplicates(users).map((u, i) => <>
                {(i < 4) && <Link key={u?.id} href={`/profile/${u?.id}`}>
                    <a>
                        <div className="avatar">
                            <div className="w-9 hover:w-14">
                                <Avatar
                                    size={'full'}
                                    name={u.displayUsername}
                                    variant="beam"
                                    colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                                />;
                            </div>
                        </div>
                    </a>
                </Link>}</>)}
        </div>

}
export default AvatarUsers