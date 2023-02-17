import { Card, Spinner } from "@bbtgnn/polaris-interfacer";
import ScreenOverlay from "./ScreenOverlay";

export default function LoadingOverlay() {
  return (
    <ScreenOverlay>
      <Card sectioned>
        <div className="p-4">
          <Spinner />
        </div>
      </Card>
    </ScreenOverlay>
  );
}
