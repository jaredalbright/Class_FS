import Day from './Day'
import { useState, useEffect } from 'react'

interface Props{
    event_obj: Object | any,
    events_update: () => void,
    user_events: Object | any
}

const Events = ({event_obj, events_update, user_events} : Props) => {
  const [userState, setUserState] = useState(user_events)

  useEffect(() => {
    console.log(userState)
    setUserState(user_events)
  }, [user_events])
  return (
    <div>
        <div className='event-container'>
        {event_obj ? 
          Object.keys(event_obj).map((day, i) => (<Day key={i} day_obj={event_obj[day]} date={day} events_update={events_update} user_events={userState}/>)) 
        : <h3> Loading ...</h3>}
        </div>
    </div>
  )
}

export default Events