import { Tag } from "@bbtgnn/polaris-interfacer";
import SearchTags from "./SearchTags";
import { FieldInfoProps } from "./polaris/types";

//

export interface SelectTags2Props extends Partial<FieldInfoProps> {
  tags: Array<string>;
  setTags: (tags: Array<string>) => void;
}

//

export default function SelectTags(props: SelectTags2Props) {
  const { tags, setTags } = props;

  function handleSelect(tag: string) {
    setTags([...tags, tag]);
  }
  function handleRemove(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  return (
    <div className="space-y-4">
      <SearchTags
        exclude={tags}
        onSelect={handleSelect}
        creatable
        label={props.label}
        placeholder={props.placeholder}
        requiredIndicator={props.requiredIndicator}
        error={props.error}
        helpText={props.helpText}
      />

      <div className="flex flex-wrap gap-y-2 gap-2">
        {tags?.map(tag => (
          <Tag
            key={tag}
            onRemove={() => {
              handleRemove(tag);
            }}
          >
            {decodeURIComponent(tag)}
          </Tag>
        ))}
      </div>
    </div>
  );
}
