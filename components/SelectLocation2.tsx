import { SelectOnChange, SelectOption } from "components/brickroom/utils/BrSelectUtils";
import { FetchLocation, getLocationOptions, LocationLookup, lookupLocation } from "lib/fetchLocation";
import { forwardRef } from "react";

// Components
import BrSelectSearchableAsync, { BrSelectSearchableAsyncProps } from "./brickroom/BrSelectSearchableAsync";

//

export type OnChangeBaseType = SelectOnChange<SelectOption<FetchLocation.Location>>;

export interface SelectLocationProps extends BrSelectSearchableAsyncProps, BrSelectSearchableAsyncProps {
  onChange?: (location: LocationLookup.Location | null) => void;
}

//

const SelectLocation2 = forwardRef<any, SelectLocationProps>((props, ref) => {
  const { onChange = () => {} } = props;
  const promiseOptions = (inputValue: string) => getLocationOptions(inputValue);

  // Custom onChange fetches location with coordinates
  const handleChange: OnChangeBaseType = async (newValue, actionMeta) => {
    if (!newValue) {
      onChange(null);
    } else {
      const location = await lookupLocation(newValue.value.id);
      onChange(location);
    }
  };

  return (
    <BrSelectSearchableAsync
      {...props}
      cacheOptions
      loadOptions={promiseOptions}
      defaultOptions
      onChange={handleChange} // Has to be after {...props} in order to being not overwritten by spread props
      ref={ref}
    />
  );
});

//

SelectLocation2.displayName = "SelectLocation2";
export default SelectLocation2;
