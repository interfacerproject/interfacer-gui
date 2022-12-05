import dayjs from "../lib/dayjs";

const ContributionMessage = ({ data, children }: { data: Date; children: React.ReactNode }) => {
  return (
    <div className="pb-2 my-2 border-b-2">
      <p className="mr-1">{dayjs(data).fromNow()}</p>
      <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      {children}
    </div>
  );
};

export default ContributionMessage;
