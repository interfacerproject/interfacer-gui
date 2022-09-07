import { useEffect, useState } from "react";

interface Image {
    hash: string;
    mimeType: string;
}

const AssetImage = ({image, className}: {image: Image, className: string}) => {
    const [src, setSrc] = useState('');
    useEffect(() => {
        fetch(`${process.env.FILE}/${image.hash}`, { method: 'get' }).then(async (r) => {
            setSrc(`data:${image.mimeType};base64,${await r.text()}`)
        }).catch((e) => {
            console.error(e);
        })
    }, [])

    return <img src={src} className={className} />;
}

export default AssetImage;
