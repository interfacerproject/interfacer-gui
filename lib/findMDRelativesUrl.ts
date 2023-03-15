export const findMdRelativesUrl = (mdContent: string) => {
  const relativeUrls = mdContent.match(/(?<=\]\()(?!https?:\/\/)(?!\#)(?:\.?\/)?((?:(?!\s|\)|\().)+)(?=\))/g);
  if (!relativeUrls) return [];
  return relativeUrls;
};

export const replaceMdRelativesUrl = (mdContent: string, blobUrl: string) => {
  const relativesURLs = findMdRelativesUrl(mdContent);
  relativesURLs.map(url => {
    const newUrl = url[0] === "/" ? `${blobUrl}${url}` : `${blobUrl}/${url}`;
    mdContent = mdContent.replace(url, newUrl);
  });
  return mdContent;
};
