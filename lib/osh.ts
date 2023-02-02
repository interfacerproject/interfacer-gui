export const analyze = async (repo: string) => {
  const request = { method: "POST", body: JSON.stringify({ repo: repo }) };
  const result = await (await fetch(`${process.env.NEXT_PUBLIC_OSH}/analyze`, request)).json();
  if (result.err) return result.err;
  return result.ok;
};
