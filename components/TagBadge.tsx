interface TagBadgeProps {
  text: string;
  className?: string;
}

export default function TagBadge({ text, className }: TagBadgeProps) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-ifr-sm border border-ifr bg-ifr-hover ${
        className || ""
      }`}
    >
      {text}
    </span>
  );
}
