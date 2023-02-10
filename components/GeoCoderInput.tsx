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

import { useEffect, useState } from "react";
import BrSearchableSelect from "./brickroom/BrSelectSearchable";

type Address = {
  lat: number;
  lng: number;
  address: any;
};

type GeocoderInputProps = {
  onSelect: (value?: Address) => void;
  selectedAddress: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  className?: string;
  help?: string;
  testID?: string;
};

const GeoCoderInput = ({
  onSelect,
  selectedAddress,
  label,
  placeholder,
  hint,
  error,
  className,
  help,
  testID,
}: GeocoderInputProps) => {
  const [options, setOptions] = useState([] as any[]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchResults = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_LOCATION_AUTOCOMPLETE}?q=${encodeURI(searchTerm)}`, { method: "get" }).then(
      async r => setOptions(JSON.parse(await r.text()).items)
    );
  };

  const fetchLocation = async (id: string) => {
    const data = await fetch(`${process.env.NEXT_PUBLIC_LOCATION_LOOKUP}?id=${encodeURI(id)}`).then(async r =>
      JSON.parse(await r.text())
    );
    return { lat: data.position.lat, lng: data.position.lng };
  };

  useEffect(() => {
    Promise.resolve(fetchResults());
  }, [searchTerm]);

  const handleSelectAddress = async (value?: any) => {
    if (value) {
      const location = await fetchLocation(value.value.id).then(r => r);
      onSelect({ lat: location.lat, lng: location.lng, address: value });
    } else {
      onSelect(undefined);
    }
  };
  const handleInputChange = (value: any) => {
    setSearchTerm(value);
    if (value.length === 1) {
      handleSelectAddress();
    }
  };
  return (
    <BrSearchableSelect
      value={selectedAddress.length > 0 ? { value: selectedAddress, label: selectedAddress } : ""}
      options={options?.map((o: any) => ({ label: o.address.label, value: o } as any))}
      onChange={handleSelectAddress}
      onInputChange={handleInputChange}
      placeholder={placeholder}
      inputValue={searchTerm}
      label={label}
      helpText={hint}
      error={error}
      // helpText={help}
      // onBackspace={() => handleSelectAddress()}
      id={testID}
    />
  );
};

export default GeoCoderInput;
