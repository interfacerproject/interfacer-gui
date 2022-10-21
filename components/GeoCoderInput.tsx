import React, { useEffect, useState } from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";

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
      hint={hint}
      error={error}
      help={help}
      onBackspace={() => handleSelectAddress()}
      testID={testID}
    />
  );
};

export default GeoCoderInput;
