import { SelectOnChange, SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { FetchLocation, getLocationOptions, LocationLookup, lookupLocation } from "lib/fetchLocation";
import { forwardRef } from "react";

// Components
import BrSelectSearchableAsync, { BrSelectSearchableAsyncProps } from "./brickroom/BrSelectSearchableAsync";

//

export type OnChangeBaseType = SelectOnChange<SelectOption<FetchLocation.Location>>;

export interface SelectLocationProps extends BrSelectSearchableAsyncProps, BrSelectSearchableAsyncProps {
  onChange?: SelectOnChange<SelectOption<LocationLookup.Location>>;
}

//

const SelectLocation = forwardRef<any, SelectLocationProps>((props, ref) => {
  const promiseOptions = (inputValue: string) => getLocationOptions(inputValue);

  // Custom onChange fetches location with coordinates
  const onChange: OnChangeBaseType = async (newValue, actionMeta) => {
    const location = await lookupLocation(newValue.value.id);
    // @ts-ignore
    if (props.onChange) props.onChange(location, actionMeta);
  };

  return (
    <BrSelectSearchableAsync
      {...props}
      cacheOptions
      loadOptions={promiseOptions}
      defaultOptions
      onChange={onChange} // Has to be after {...props} in order to being not overwritten by spread props
      ref={ref}
    />
  );
});

//

SelectLocation.displayName = "SelectLocation";
export default SelectLocation;
