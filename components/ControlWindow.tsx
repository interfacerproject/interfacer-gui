import {useTranslation} from "next-i18next";

const ControlWindow = ({logs}: { logs: Array<string> }) => {
    const {t} = useTranslation('createProjectProps')
    const colors = ["error", "success", "warning", "info"];
    const logsClass = (text: string) => colors.includes(text.split(':')[0]) ? `text-${text.split(':')[0]} uppercase my-3` : 'my-2'

    return (<>
        <div className="hidden text-error text-success text-warning text-info"/>
        <div className="w-full px-2 pb-2 border-2 md:w-128 md:fixed bg-white">
            <h4 className="text-primary my-2 capitalize">{t('control window')}</h4>
            <div className="overflow-y-scroll font-mono border-2 max-h-80 bg-[#F7F7F7] p-2">
                {logs.map((l, index) => <p key={index} className={logsClass(l)}>{l}</p>)}
            </div>
        </div>
    </>)
}

export default ControlWindow
