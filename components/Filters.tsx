import React, {useState} from "react";
import AddContributors from "./AddContributors";
import SelectAssetType from "./SelectAssetType";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

const Filters = ({noPrimaryAccountableFilter=false}) => {
    const [contributors, setContributors] = useState<Array<{ value:string, label:string }>>([]);
    const [conformsTo, setConformsTo] = useState<Array<{ value:string, label:string }>>([]);
    const {t} = useTranslation('lastUpdatedProps')
    const router = useRouter()
    const applyFilters = () => {
        const query = router.query
        if (contributors.length > 0) {
            const primaryAccountable: string = contributors.map((c: any) => c.value).join(',')
            query.primaryAccountable = primaryAccountable
        }
        if (conformsTo.length > 0) {
            const conforms = conformsTo.map((c: any) => c.value).join(',')
            query.conformTo = conforms
        }
        router.push({
            pathname: router.pathname,
            query,
        })
    }
    const clearFilters = () => {
        const query = router.query
        delete query.primaryAccountable
        delete query.conformTo
        setContributors([])
        setConformsTo([])
        router.push({
            pathname: router.pathname,
            query,
        })
    }
    return(
        <div className="p-4 bg-white border rounded-lg shadow">
                <h4 className="mb-4 text-2xl font-bold">{t('filters.filter for')}:</h4>
                {!noPrimaryAccountableFilter && <AddContributors contributors={contributors.map((c: any) => ({name:c.label, id:c.value}))}
                                                                 setContributors={setContributors}
                                                                 label={t('filters.contributors')}/>}
                <SelectAssetType onChange={setConformsTo} label={t('filters.type')} assetType={conformsTo}/>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                        <button className="btn btn-outline btn-error btn-block"
                                onClick={clearFilters}>{t('filters.reset')}
                        </button>
                    </div>
                    <div>
                        <button onClick={applyFilters}
                                className="btn btn-accent btn-block">{t('filters.apply')}</button>
                    </div>
                </div>
            </div>
    )

}

export default Filters
