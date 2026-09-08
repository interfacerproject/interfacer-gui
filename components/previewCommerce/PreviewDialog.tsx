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
 * Buttons in the commerce screens that would trigger a real action (Place
 * order, Set up payouts, Update stock …) open this instead — the feature is
 * still being built.
 *
 * Usage:
 *   const dialog = usePreviewDialog();
 *   <button onClick={() => dialog.open("Set up payouts")}>Set up payouts</button>
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
      title={t("Coming soon")}
      primaryAction={{ content: t("Got it"), onAction: onClose }}
    >
      <Text as="p" variant="bodyMd">
        {action ? t('"{{action}}" is not available yet.', { action }) : t("This is not available yet.")}{" "}
        {t(
          "Selling and buying on Interfacer is an upcoming feature and is still being built — these screens preview how it will work."
        )}
      </Text>
    </Modal>
  );
}
