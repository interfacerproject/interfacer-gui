import BrSelect from "./brickroom/BrSelect";
import { useRouter } from "next/router";

const LocationMenu = ({ className }: { className?: string }) => {
    const router = useRouter()
    const { pathname, asPath, query, locale } = router
    const handleSelect = (e: any) => {
        e.preventDefault()
        router.push({ pathname, query }, asPath, { locale: e.target.value })
    }
    return <BrSelect className={className}
        array={[
            { id: 'en', name: 'en' },
            { id: 'de', name: 'de' },
            { id: 'fr', name: 'fr' },
            { id: 'it', name: 'it' }
        ]}
        handleSelect={handleSelect}
        value={locale} roundedLG />
}
export default LocationMenu
