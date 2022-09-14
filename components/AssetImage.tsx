import { useEffect, useState } from "react";

interface Image {
    hash: string;
    mimeType: string;
    bin: string;
}

const AssetImage = ({ image, className }: { image: Image, className: string }) => {
    return (<>
        <img src={`data:${image.mimeType};base64,${image.bin}`} className={className} />
    </>)
}

export default AssetImage;
