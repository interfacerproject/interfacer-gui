import React from "react";
import Link from "next/link";

const CreateProjectButton = ({ className, text = "Create a new asset" }: { className?: string; text?: string }) => {
  return (
    <>
      <Link href="/create_asset">
        <a className={`btn normal-case btn-accent ${className}`}>{text}</a>
      </Link>
    </>
  );
};

export default CreateProjectButton;
