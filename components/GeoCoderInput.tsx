import React, {useEffect, useState} from "react";
import devLog from "../lib/devLog";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";

type Address = {
    lat: number
    lng: number
    address: any

}

type GeocoderInputProps = {
    onSelect: (value: Address) => void;
    value?: any
    label?: string
    placeholder?: string
    hint?: string
    error?: string
    className?: string
    help?: string
}

const GeoCoderInput = ({onSelect, value, label, placeholder, hint, error, className, help}: GeocoderInputProps) => {
    const [address] = useState(value.address)
    const [options, setOptions] = useState([] as any[])
    const [searchTerm, setSearchTerm] = useState('')

    const fetchResults = async () => {
        await fetch(`https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURI(searchTerm)}&apiKey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`,
            {method: 'get'}).then(async (r) => setOptions(JSON.parse(await r.text()).items))
    }
    const fetchLocation = async (id: string) => {
        const data = await fetch(`https://lookup.search.hereapi.com/v1/lookup?id=${encodeURI(id)}&apiKey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`)
            .then(async (r) => JSON.parse(await r.text()))
        return {lat: data.position.lat, lng: data.position.lng}
    }
    useEffect(() => {
        Promise.resolve(fetchResults())
    }, [searchTerm])

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            height: 48,
            border: state.isFocused ? '2px solid green' : 'blue',
        }),
    }

    const handleSelectAddress = async (value: any) => {
        devLog('address chosen', value.label)
        const location = await fetchLocation(value.value.id).then((r) => r)
        devLog('location', location)
        onSelect({lat: location.lat, lng: location.lng, address: value})
    }
    return (<BrSearchableSelect value={address}
                            options={options?.map((o: any) => ({label: o.address.label, value: o} as any))}
                            onChange={handleSelectAddress}
                            onInputChange={setSearchTerm}
                            placeholder={placeholder}
                            inputValue={searchTerm}
                            label={label}
                            hint={hint}
                            error={error}
                            help={help}
    />)
}

export default GeoCoderInput
