import Hour from './Hour'
import { useEffect, useState } from 'react'

interface Props{
    day_obj: Object | any,
    date: string,
    events_update: () => void,
    user_events: Object | any
}

const Day = ({day_obj, date, events_update, user_events} : Props) => {
    const [userState, setUserState] = useState(user_events)
    const [day, setDay]= useState<string>("");
    const get_day = (day : string) => {
        const weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
        const d = new Date(day);
        setDay(weekday[d.getDay()])
    }

    useEffect(() => {
        get_day(date);
        setUserState(user_events);
    }, [user_events, date])

    return (
        <div className='day-container'>
            <h5 className='event-card-align'>{day}</h5>
            <h6 className='event-card-align'>{date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2-$3")}</h6>
        {day_obj ? Object.keys(day_obj).map((hour, i) => (<Hour key={i} hour_obj={day_obj[hour]} time={hour} e_date={date} events_update={events_update} day = {day} user_events={userState}/>)) : <h3>Loading</h3>}
        </div>
    )
}

export default Day