import { Stack, Text, TextProps } from "@bbtgnn/polaris-interfacer";

export interface Props {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  titleTag?: "h1" | "h2";
}

export default function PTitleSubtitle(props: Props) {
  const { title = "", subtitle = "", titleTag = "h1" } = props;

  const titleVariant: Record<string, TextProps["variant"]> = {
    h1: "heading2xl",
    h2: "headingXl",
  };

  return (
    <Stack vertical spacing="baseTight">
      {title && (
        <Text variant={titleVariant[titleTag]} as={titleTag}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text variant="bodyMd" as="p" color="subdued">
          {subtitle}
        </Text>
      )}
    </Stack>
  );
}
