import { Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { License } from "lib/licenses/types";

export interface Props {
  label: string;
  license: License;
}

export default function LicenseDisplay(props: Props) {
  const { label, license } = props;

  return (
    <Stack vertical spacing="extraTight">
      <Text as="p" variant="bodyMd" fontWeight="bold">
        {label}
      </Text>
      <Text as="p" variant="bodyMd">
        <Link external url={license.reference}>
          {license.name}
        </Link>
      </Text>
    </Stack>
  );
}
