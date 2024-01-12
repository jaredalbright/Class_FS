import Day from './Day'

interface Props{
    event_obj: Object | any,
    events_update: () => void,
    user_events: Object | any
}

const Events = ({event_obj, events_update, user_events} : Props) => {
  return (
    <div>
        <div className='event-container'>
        {event_obj ? 
          Object.keys(event_obj).map((day, i) => (<Day key={i} day_obj={event_obj[day]} date={day} events_update={events_update} user_events={user_events}/>)) 
        : <h3> Loading ...</h3>}
        </div>
    </div>
  )
}

export default Events