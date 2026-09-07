// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Modal, Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";

/**
 * Every outbound-looking action in the preview (Track order, View DPP, Connect
 * Stripe, Contact Manufacturer …) opens this instead of going anywhere.
 *
 * Usage:
 *   const dialog = usePreviewDialog();
 *   <button onClick={() => dialog.open("View DPP")}>View DPP</button>
 *   {dialog.element}
 */
export function usePreviewDialog() {
  const [action, setAction] = useState<string | null>(null);
  const open = useCallback((label: string) => setAction(label), []);
  const close = useCallback(() => setAction(null), []);
  return { open, close, element: <PreviewDialog action={action} onClose={close} /> };
}

interface Props {
  action: string | null;
  onClose: () => void;
}

export default function PreviewDialog({ action, onClose }: Props) {
  const { t } = useTranslation("commercePreviewProps");
  return (
    <Modal
      small
      sectioned
      open={action !== null}
      onClose={onClose}
      title={t("Part of the preview")}
      primaryAction={{ content: t("Got it"), onAction: onClose }}
    >
      <Text as="p" variant="bodyMd">
        {action
          ? t('"{{action}}" is part of the commerce preview.', { action })
          : t("This is part of the commerce preview.")}{" "}
        {t(
          "It has no live counterpart yet — no order is tracked, no passport is minted, no account is connected. The screens exist to show the shape of the upcoming Medusa integration."
        )}
      </Text>
    </Modal>
  );
}
