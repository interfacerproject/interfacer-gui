import { Tag } from "@bbtgnn/polaris-interfacer";
import SearchTags from "./SearchTags";
import { FieldInfoProps } from "./polaris/types";
import BrTag from "./brickroom/BrTag";

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
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-y-2 gap-2">
          {tags?.map(tag => (
            <BrTag
              key={tag}
              onRemove={() => {
                handleRemove(tag);
              }}
              tag={decodeURIComponent(tag)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
