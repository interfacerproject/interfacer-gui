export interface Props {
  id?: string;
}

export default function PDivider(props: Props) {
  const { id = "" } = props;

  return (
    <div className="py-8">
      <hr id={id} className="border-t-[1px] border-t-border-subdued" />
    </div>
  );
}
