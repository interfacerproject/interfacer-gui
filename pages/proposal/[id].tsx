import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { QUERY_PROPOSAL } from "../../lib/QueryAndMutation";

const Proposal = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useQuery(QUERY_PROPOSAL, { variables: { id: id?.toString() || "" } });

  return (
    <div>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
};

export default Proposal;
