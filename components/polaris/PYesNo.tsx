import { Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";

export interface Props {
  name: string;
}

export default function PYesNo(props: Props) {
  const { t } = useTranslation();
  const { name } = props;

  const options = [
    { label: t("Yes"), value: "yes" },
    { label: t("No"), value: "no" },
  ];

  return (
    <div className="flex flex-row rounded-sm">
      {options.map(option => (
        <label key={option.value} className="grow p-4 space-x-2 border-[1px] border-border-subdued">
          <input type="radio" value={option.value} name={name} id={option.value} />
          <Text as="span" variant="bodyMd">
            {option.label}
          </Text>
        </label>
      ))}
    </div>
  );
}
