import { EconomicResource } from "lib/types";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "../lib/dayjs";
import AvatarUsers from "./AvatarUsers";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTags from "./brickroom/BrTags";
import ProjectThumb from "./ProjectThumb";

const ProjectsTableRow = (props: { project: { node: EconomicResource } }) => {
  const e = props.project.node;
  const router = useRouter();

  // @ts-ignore
  const data = e.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime;

  const conformsToColors: { [key: string]: string } = {
    Design: "bg-[#E4CCE3] text-[#C18ABF] border-[#C18ABF]",
    Product: "bg-[#CDE4DF] text-[#614C1F] border-[#614C1F]",
    Service: "bg-[#FAE5B7] text-[#A05D5D] border-[#A05D5D]",
  };

  const handleCoformstoClick = (conformsTo: string) => {
    router.query.conformsTo = conformsTo;
    router.push({ pathname: router.pathname, query: router.query });
  };

  if (!e) return <tr></tr>;

  return (
    <tr>
      <td className="hover:bg-gray-50 hover:cursor-pointer rounded-md">
        <Link href={`/project/${e.id}`}>
          <div className="flex items-center space-x-4">
            <div className="shrink-0">
              <ProjectThumb project={e} />
            </div>
            <h3 className="break-words whitespace-normal">{e.name}</h3>
            {/* <p className="text-sm text-gray-500">{e.note}</p> */}
          </div>
        </Link>
      </td>

      <td>
        <button
          onClick={() => handleCoformstoClick(e.conformsTo?.id)}
          className={`${
            conformsToColors[e.conformsTo!.name]
          } border-[1px] rounded-[4px] text-sm float-left mb-1 mr-1 px-0.5`}
        >
          {e.conformsTo?.name}
        </button>
      </td>

      <td className="">
        <p className="mr-1">{dayjs(data).fromNow()}</p>
        <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      </td>

      <td className="max-w-[12rem]">
        <BrTags tags={e.classifiedAs!} />
      </td>

      <td>
        <BrDisplayUser id={e.primaryAccountable.id} name={e.primaryAccountable.name} />
        <AvatarUsers users={e.metadata?.contributors} />
      </td>
    </tr>
  );
};

export default ProjectsTableRow;
