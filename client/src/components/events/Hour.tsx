import {useEffect, useState} from 'react'
import EventCard from './EventCard'

interface Props {
    hour_obj: Object | any,
    time: String | any,
    e_date: String | any,
    events_update: () => void,
    day: string,
    user_events: Object | any
}

const Hour = ({hour_obj, time, e_date, day, events_update, user_events} : Props) => {
  const [filterEvents, setFilterEvents] = useState<any>([]);
  useEffect(() => {
    if (user_events) {
      const output = hour_obj.filter((act : any) => !user_events.hasOwnProperty(act.event_id));
      setFilterEvents(output);
    }
    else {
      setFilterEvents(hour_obj)
    }
  }, [user_events])

  return (
    <>
        {(filterEvents.length > 0) ? <div>
          <h6 className='time-format event-card-align'>{time}</h6>
          {filterEvents.map((act :any, i: string) => 
        (<EventCard key={i} event_obj={act} start_time={time} e_date={e_date} day={day} events_update={events_update}/>))} 
        </div>
      : <></>}
    </>
  )
}

export default Hour