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

export interface Props {
  name: string;
  preview: string;
}

export default function BrImageUploadThumb(props: Props) {
  const { name, preview } = props;

  return (
    <div className="inline-flex rounded-sm w-24 h-24 p-2">
      <div className="flex overflow-hidden min-w-0">
        <img
          src={preview}
          className="block w-auto h-full border-[1px] border-gray-300"
          alt={name}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(preview);
          }}
        />
      </div>
    </div>
  );
}
