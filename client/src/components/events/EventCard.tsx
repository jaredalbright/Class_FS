import { useState } from "react";

interface EventObj {
    name: string,
    event_id: string,
    end: string,
    location: string,
    paid: boolean
}

interface Props {
    event_obj: EventObj,
    start_time: string
}

const EventCard = ({event_obj, start_time} : Props) => {
    const [showButton, setShowButton] = useState<boolean>(false);

    const checkPlusOne = (text : string) => {
        const index = text.indexOf("Each member that signs up bring 1 member");

        if (index !== -1) {
            return true;
        }
        return false;
    }

    const textParse = (text : string) => {
        let parsed_text = text;
        const plusOne = checkPlusOne(text);

        const range = new RegExp("\\d+\\.\\d+-\\d+\\.\\d+");
        const range_m = text.match(range); 

        const above = new RegExp("\\d+\\.\\d+\\+");
        const above_m = text.match(above); 

        if (range_m) {
            parsed_text = "DUPR range: " + range_m[0];
        }
        else if (above_m) {
            parsed_text = "DUPR: " + above_m[0];
        }

        if (text.indexOf("NR") !== -1) {
            parsed_text = parsed_text + " and NR"
        }

        if (text.toUpperCase().indexOf("ALL LEVELS") !== -1 || text.indexOf("Pickleball Open Play: Drill and Play") !== -1) {
            parsed_text = "All Levels Play"
        }

        if (plusOne) {
            parsed_text = parsed_text + " (PLUS 1)"
        }

        return parsed_text
    }

    return (
    <div className="event-card event-card-align" onClick={() => setShowButton(!showButton)}>
        <h6>{showButton ?  event_obj.name : textParse(event_obj.name)}</h6>
        {event_obj.paid ? <h6>EXTRA COST $$$</h6> : <></>}
        <p className='time'>{start_time} - {event_obj.end}</p>
        <p className='location'>{showButton ? event_obj.location : event_obj.location.split(",")[1]}</p>
    </div>
  )
}

export default EventCard