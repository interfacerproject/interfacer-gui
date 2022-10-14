export function truncate(input: string | undefined | null, max: number) {
  if (!input) return "";
  return input?.length > max ? `${input.substring(0, max)}...` : input;
}
