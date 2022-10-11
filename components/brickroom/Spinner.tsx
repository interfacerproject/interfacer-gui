import React from "react";
import { RefreshIcon } from "@heroicons/react/solid";

const Spinner = () => {
  return (
    <div className="grid grid-cols-1 place-items-center h-48 w-full">
      <RefreshIcon className="w-6 h-6 animate-spin" />
    </div>
  );
};
export default Spinner;
