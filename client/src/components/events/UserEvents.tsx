import { useEffect, useState } from 'react'
import UserEventCard from './UserEventCard'

interface Props {
  user_events: Object | any,
  events_update: () => void
}

const UserEvents = ({user_events, events_update}: Props) => {
  const [userState, setUserState] = useState<any>(undefined)

  useEffect(() => {
    console.log(userState)
    setUserState(user_events)
  }, [user_events])
  return (
    <div className='event-container'>
    {userState ? Object.keys(userState).map((event, i) => (<UserEventCard  key={i} event_obj={userState[event]} event_id={event} events_update={events_update}/>)) : <></>}
    </div>
  )
}

export default UserEvents