import { NextPage } from 'next';
import useStorage from "../lib/useStorage";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";



const Logged_in: NextPage = () => {
    const {getItem } = useStorage()
    const username = getItem('authName')

    return (<div className="p-8">
        <h1>Hello {username}</h1>
        <h2>How did you arrived here? This app is still under construction!</h2>
        </div>
    )
}
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['signInProps', 'SideBarProps'])),
    },
  };
}
export default Logged_in;
