import { Button, ButtonGroup } from "@bbtgnn/polaris-interfacer";
import { SelectOption } from "components/types";

//

export interface Props {
  options: Array<SelectOption>;
  onChange?: (value: string) => void;
  selected?: string;
  id?: string;
}

export default function PButtonRadio(props: Props) {
  const { onChange = () => {}, selected = "", id } = props;

  return (
    <ButtonGroup segmented fullWidth>
      {props.options.map(option => (
        <Button
          id={`${id}-${option.value}`}
          key={option.value}
          pressed={selected == option.value}
          onClick={() => {
            onChange(option.value);
          }}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
