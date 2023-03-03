import PCardWithAction from "components/polaris/PCardWithAction";
import { LocationLookup } from "lib/fetchLocation";
import { PFieldInfoProps } from "./polaris/PFieldInfo";
import SearchLocation from "./SearchLocation";

//

export interface SelectedLocation {
  address: string;
  lat: number;
  lng: number;
}

interface Props extends Partial<PFieldInfoProps> {
  location?: SelectedLocation | null;
  setLocation?: (location: SelectedLocation | null) => void;
  placeholder?: string;
}

//

export default function SelectLocation2(props: Props) {
  const { location = null, setLocation = () => {} } = props;

  function handleSelect(loc: LocationLookup.Location | null) {
    setLocation(loc ? { address: loc.title, lat: loc.position.lat, lng: loc.position.lng } : null);
  }

  function handleRemove() {
    setLocation(null);
  }

  return (
    <div className="space-y-3">
      <SearchLocation
        onSelect={handleSelect}
        label={props.label}
        error={props.error}
        helpText={props.helpText}
        placeholder={props.placeholder}
        requiredIndicator={props.requiredIndicator}
      />
      {location && (
        <PCardWithAction onClick={handleRemove}>
          <div>
            <p>{location.address}</p>
            <p className="font-mono">
              <span className="font-bold">{"Lat: "}</span>
              <span>{location.lat}</span>
              <span>{" | "}</span>
              <span className="font-bold">{"Lng :"}</span>
              <span>{location.lng}</span>
            </p>
          </div>
        </PCardWithAction>
      )}
    </div>
  );
}
