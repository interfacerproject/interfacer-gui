import { Stack, Tag } from "@bbtgnn/polaris-interfacer";
import { FieldInfoProps } from "./polaris/types";
import SearchTags from "./SearchTags";

//

export interface SelectTags2Props extends Partial<FieldInfoProps> {
  tags: Array<string>;
  setTags: (tags: Array<string>) => void;
}

//

export default function SelectTags2(props: SelectTags2Props) {
  const { tags, setTags } = props;

  function handleSelect(tag: string) {
    setTags([...tags, tag]);
  }
  function handleRemove(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  return (
    <Stack vertical>
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

      <div className="flex space-x-2">
        {tags.map(tag => (
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
    </Stack>
  );
}