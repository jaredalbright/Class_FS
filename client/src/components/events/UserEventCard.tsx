import { useState } from 'react'
import { eventNameParse } from '../../services/card.service';
import Modal from 'react-bootstrap/Modal';
import { deleteUserEvent } from '../../services/event.service';
import { getCurrentUser } from '../../services/auth.service';

interface EventObj {
    name: string,
    event_id: string,
    end: string,
    start: string,
    location: string,
    paid: boolean,
    day: string,
    date: string,
    other_members: Array<Member>
}

interface Member {
    name: string,
    id: number
}

interface Props {
    event_obj: EventObj,
    event_id: any,
    events_update: () => void
}

const UserEventCard = ({ event_obj, event_id, events_update }: Props) => {
    const [showButton, setShowButton] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const confirm = async () => {
        const user = getCurrentUser();

        if (await deleteUserEvent(event_id, user.email)) {
            events_update();
            setShowConfirm(false);        
        }
    }
    return (
        <>
        <div className="event-card event-card-align event-card-user" onClick={() => setShowButton(!showButton)}>
            <h6>{showButton ? event_obj.name : eventNameParse(event_obj.name)}</h6>
            <p className='user-time'><b>{event_obj.start}</b> - {event_obj.end}</p>
            <p className='user-date'>{event_obj.day} {event_obj.date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2-$3")}</p>
            <div className='time'>{showButton ? <p>Other Members: {event_obj.other_members.map((member) => (member.name))} </p>: <></>}</div>
            <p className='location'>{showButton ? event_obj.location : event_obj.location.split(",")[1]}</p>
            {showButton ? <button className="booking booking-confirm" onClick={() => setShowConfirm(true)}>Delete Booking</button> : <></>}
        </div>
        <Modal show={showConfirm} onHide={() => {setShowConfirm(false)}}>
                <Modal.Header closeButton>
                <Modal.Title>{event_obj.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {event_obj.other_members.length > 0 ?  <p>Other Members: {event_obj.other_members.map((member) => (member.name))}</p> : <></>}
                    <p>Warning deleting this booking will delete for all members. To add additional members please delete and rebook.</p>
                    <p>If the class has already been booked this will not delete the class.</p>
                </Modal.Body>
                <Modal.Footer>
                <button className="booking booking-cancel" onClick={() => {setShowConfirm(false)}}>
                    Cancel
                </button>
                <button className="booking booking-confirm" onClick={() => {confirm()}}>
                    Confirm Delete
                </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default UserEventCard