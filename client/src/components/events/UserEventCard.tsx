import { useState } from 'react'

interface EventObj {
    name: string,
    event_id: string,
    end: string,
    start: string,
    location: string,
    paid: boolean,
    day: string,
    date: string
}

interface Props {
    event_obj: EventObj
}

const UserEventCard = ({ event_obj }: Props) => {
    const [showButton, setShowButton] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    return (
        <>
        <div className="event-card event-card-align">
            <h6>{event_obj.name}</h6>
            <p className='time'>{event_obj.day} - {event_obj.date}</p>
            <p className='time'>{event_obj.start} - {event_obj.end}</p>
            <p className='location'>{showButton ? event_obj.location : event_obj.location.split(",")[1]}</p>
        </div>
        </>
    )
}

export default UserEventCard