import Avatar from "boring-avatars";
import Link from "next/link";

type BrDisplayUserProps = {
    id: string,
    name: string
}

const BrDisplayUser = (props: BrDisplayUserProps) => {
    return (
        <Link href={`/profile/${props.id}`}>
            <a className="pl-0 flex items-center">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <Avatar
                            size={'full'}
                            name={props.name}
                            variant="beam"
                            colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                        />;
                    </div>
                </label>
                <h4 className="flex-auto text-primary">
                    {props.name}
                </h4>
            </a>
        </Link>
    )
}
export default BrDisplayUser