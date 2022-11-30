import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

const SearchBar = () => {
  const router = useRouter();
  const { q } = useRouter().query;
  const [searchString, setSearchString] = useState(q || "");
  const { t } = useTranslation("common");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/search?q=${searchString}`);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder={t("search") + "..."}
        className="input rounded-xl input-bordered w-128"
        onKeyDown={handleKeyDown}
        onChange={e => setSearchString(e.target.value)}
      />
    </>
  );
};

export default SearchBar;
