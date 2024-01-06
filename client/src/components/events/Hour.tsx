import React from 'react'
import EventCard from './EventCard'

interface Props {
    hour_obj: Object | any,
    time: String | any,
    e_date: String | any
}

const Hour = ({hour_obj, time, e_date} : Props) => {
  return (
    <div>
        <h6 className='time-format event-card-align'>{time}</h6>
        {hour_obj ? Object.keys(hour_obj).map((act, i) => (<EventCard key={i} event_obj={hour_obj[act]} start_time={time} e_date={e_date}/>)) : <h3>Loading</h3>}
    </div>
  )
}

export default Hour