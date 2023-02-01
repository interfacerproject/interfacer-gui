import { Button, ButtonGroup } from "@bbtgnn/polaris-interfacer";
import { SelectOption } from "components/types";
import { useState } from "react";

//

export interface Props {
  options: Array<SelectOption>;
  onChange?: (value: string) => void;
}

export default function PButtonRadio(props: Props) {
  const { onChange = () => {} } = props;
  const [pressedButton, setPressedButton] = useState(props.options[0].value);

  return (
    <ButtonGroup segmented fullWidth>
      {props.options.map(option => (
        <Button
          key={option.value}
          pressed={pressedButton == option.value}
          onClick={() => {
            onChange(option.value);
            setPressedButton(option.value);
          }}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
