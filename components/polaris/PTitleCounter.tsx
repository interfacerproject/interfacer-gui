import { Badge, Stack, Text, TextProps } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";

export interface Props {
  title?: string | React.ReactNode;
  length?: number;
  titleTag?: "h1" | "h2";
}

export default function PTitleSubtitle(props: Props) {
  const { t } = useTranslation("common");
  const { title = "", length = 0, titleTag = "h1" } = props;
  const titleVariant: Record<string, TextProps["variant"]> = {
    h1: "heading3xl",
    h2: "headingXl",
  };

  return (
    <Stack spacing="loose" alignment="center">
      {title && (
        <Text variant={titleVariant[titleTag]} as={titleTag}>
          {title}
        </Text>
      )}
      {length > 0 && <Badge status="success">{t("{{length}} results", { length: length })}</Badge>}
    </Stack>
  );
}
