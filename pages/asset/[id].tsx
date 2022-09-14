import { gql, useQuery } from "@apollo/client";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import AssetImage from '../../components/AssetImage';
import BrDisplayUser from '../../components/brickroom/BrDisplayUser';
import BrTags from '../../components/brickroom/BrTags';
import MdParser from "../../lib/MdParser";

interface AssetIface {
    name: string;
    conformsTo: {
        name: string;
    };
    images: [{
        hash: string;
        mimeType: string;
        bin: string;
    }];
    note: string;
    tags: string[];
    primaryAccountable: {
        id: string;
        name: string;
    };
    currentLocation: {
        name: string;
    };
}

const Asset = () => {
    const router = useRouter()
    const { id } = router.query
    const { t } = useTranslation('common')
    const [mainImage, setMainImage] = useState('');
    const [asset, setAsset] = useState<AssetIface|undefined>();
    const QUERY_ASSET = gql`query ($id: ID!) {
  proposal(id: $id) {
    primaryIntents {
      resourceInventoriedAs {
        conformsTo {
          name
        }
        currentLocation {
          name
        }
        name
        id
        note
        primaryAccountable {
          name
          id
        }
        onhandQuantity {
          hasUnit {
            label
          }
        }
        images {
          hash
          name
          mimeType
          bin
        }
      }
    }
    reciprocalIntents {
      resourceQuantity {
        hasNumericalValue
        hasUnit {
          label
          symbol
        }
      }
    }
  }
}
`
    const { loading, error, data, startPolling } = useQuery(QUERY_ASSET, { variables: { id } })
    startPolling(2000)

    useEffect(() => {
        const _asset: AssetIface = data?.proposal.primaryIntents[0].resourceInventoriedAs;
        const _image = _asset?.images[0];
        setMainImage(`data:${_image?.mimeType};base64,${_image?.bin}`);
        setAsset(_asset)
    }, [data])

    return (<>
        {asset && <>
            <div className="relative">
                <div className='w-full bg-center bg-cover backdrop-grayscale-0 h-72'
                    style={{ backgroundImage: `url(${mainImage})`, filter: "blur(1px)" }}></div>
                <div className="absolute top-0 w-full p-2 md:p-8 h-72 backdrop-grayscale bg-white/70">
                    <div className="text-primary breadcrumbs">
                        <ul>
                            <li><a><h4>{asset.conformsTo.name}</h4></a></li>
                        </ul>
                    </div>
                </div>
                <div className="absolute w-full p-2 bottom-8 md:p-0 md:bottom-12 h-100">
                    <div className="flex flex-col content-end h-full md:mx-32 md:w-1/2">
                        <h2>{asset.name}</h2>
                        <p>{t('This is a')} <span className="font-bold text-primary">{asset.conformsTo.name}</span></p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 px-2 md:grid-cols-3 md:gap-4 md:px-0 md:mx-32">
                <div id="left-col" className="flex flex-col col-span-2 space-y-14">
                    <div id="tabs" className="hidden my-6 space-x-8 md:block">
                        <button className="px-12 text-black bg-gray-300 border-0 rounded-lg btn">{t("Overview")}</button>
                        <span className="rounded-lg btn btn-disabled">{t("Contributions")}</span>
                        <span className="rounded-lg btn btn-disabled">{t("DPP")}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: MdParser.render(asset.note.split(':')[1].split(',')[0]) }}/>
                    <div id="tags">
                        <BrTags tags={asset?.tags || ["lasercutter", "lasercut", "DIY", "kit"]} />
                    </div>
                    <div id="images">
                        {asset?.images.map((image, i) => <AssetImage key={i} image={image} className="w-1/2" />)}
                    </div>
                </div>
                <div id="right-col" className="flex flex-col mt-16">
                    <p>{t('Value of this asset')}:</p>
                    <div className="mt-2 mb-6 space-x-2 font-bold font-display">
                        <span className="text-2xl">{data?.proposal.reciprocalIntents[0].resourceQuantity.hasNumericalValue}</span>
                        <span className="text-xl">{t("Fab Token")}</span>
                        <span className="font-sans font-normal">/{data?.proposal.primaryIntents[0].resourceInventoriedAs.onhandQuantity.hasUnit.label}</span>
                    </div>
                    <button className="px-20 mb-4 btn btn-accent btn-block">{t("Buy this asset")}</button>
                    <button className="btn btn-accent btn-outline btn-block" tabIndex={-1} role="button" aria-disabled="true">{t("Add to list +")}</button>
                    <p className="mt-8 mb-2">{t("Owner")}:</p>
                    <BrDisplayUser id={asset.primaryAccountable.id} name={asset.primaryAccountable.name} location={asset.currentLocation.name} />
                </div>
            </div>
        </>
        }
    </>
    )

}
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}


export async function getStaticProps({ locale }: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common', 'signInProps', 'SideBarProps'])),
        },
    };
}

export default Asset;
