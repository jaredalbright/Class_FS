import React from 'react'
import Day from './Day'

interface Props{
    event_obj: Object | any
}

const Events = ({event_obj} : Props) => {
  return (
    <div>
        <h2>Next Weeks Events</h2>
        <div className='event-container'>
        {event_obj ? Object.keys(event_obj).map((day, i) => (<Day key={i} day_obj={event_obj[day]} date={day} />)) : <h3> Loading ...</h3>}
        </div>
    </div>
  )
}

export default Events