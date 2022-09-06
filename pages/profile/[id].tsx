import type {NextPage} from 'next'
import {useAuth} from "../../lib/auth";
import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import Tabs from "../../components/Tabs";
// import EventTable from "../../components/EventTable";
import Spinner from "../../components/brickroom/Spinner";
import ResourceTable from "../../components/ResourceTable";
import devLog from "../../lib/devLog";


const Profile: NextPage = () => {
    const router = useRouter()
    const {id} = router.query
    const FETCH_USER = gql(`query($id:ID!) {
  person(id:$id) {
    id
    name
    email
    user
    ethereumAddress
    primaryLocation {
      name
      mappableAddress
    }
  }
}`)

    const {authId, authUsername, authName, authEmail} = useAuth()
    const isUser: boolean = (id === 'my_profile' || id === authId)
    const idToBeFetch = isUser ? authId : id
    const user = useQuery(FETCH_USER, {variables: {id: idToBeFetch}}).data?.person
    devLog(user)
    const tabsArray = [
        // {title: 'Activity', component: <EventTable economicEvents={user?.economicEvents}/>},
        {
            title: 'Inventory',
            component: <ResourceTable resources={user?.inventoriedEconomicResources}/>
        }
    ]
    return (<>
        {!user && <Spinner/>}
        {user && <>
                <h2 className="mb-6">{user?.name}</h2>
                <h3 className="mb-6">Name: {user?.name}</h3>
                <h3 className="mb-6">UserName: {user?.user}</h3>
                <h3 className="mb-6">Email: {user?.email}</h3>
            {/*<Tabs tabsArray={tabsArray}/>*/}
        </>}
    </>)
};

export default Profile


