import { ChangeEvent, useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import { getCurrentUser } from './../../services/auth.service';
import { addUserEvent } from "../../services/event.service";
import { eventNameParse } from "../../services/card.service";
import LoadingAnimation from "../LoadingAnimation";

interface EventObj {
    name: string,
    event_id: string,
    end: string,
    location: string,
    paid: boolean,
    day: string
}

interface Props {
    event_obj: EventObj,
    start_time: string,
    e_date: string,
    day: string,
    events_update: () => void
}

interface Member {
    name: string,
    id: number
}

const EventCard = ({ event_obj, start_time, e_date, day, events_update }: Props) => {
    const [showButton, setShowButton] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [otherMembers, setOtherMembers] = useState<Member[] | undefined>(undefined);
    const [confirmedMembers, setConfirmedMembers] = useState<Member[]>([]);


    const setMemberCheck = (e: ChangeEvent<HTMLInputElement>,new_member : Member) => {
        let addedMembers = confirmedMembers;

        console.log(new_member);

        if (e.target.checked) {
            addedMembers.push(new_member);
        }
        else {
            const index = addedMembers.indexOf(new_member);
            if (index != -1) {
                addedMembers.splice(index, 1);
            }
        }
        setConfirmedMembers(addedMembers);
    }

    // needs to be async so that the user event is added before update is triggered
    const confirm = async () => {
        setShowLoading(true);
        let otherMembers = confirmedMembers;

        const memberIDs = otherMembers.map((member) => (member.id));
        const user = getCurrentUser();
        memberIDs.push(user.memberId);
        
        const res = await addUserEvent(event_obj, start_time, e_date, user.email, memberIDs, day, otherMembers);
        if (res) {
            events_update();
        }
        setShowConfirm(false);
        setShowLoading(false);
        setConfirmedMembers([]);
    }

    useEffect(() => {
        const user = getCurrentUser();
        let member_list: Array<Member> = [];
        for (const member in user.otherMembers) {
            const member_props = {name: member, id: user.otherMembers[member]} as Member;
            member_list.push(member_props);
        }
        setOtherMembers(member_list);

    }, [])
    return (
        <div>
        <div className="event-card event-card-align event-card-reg" onClick={() => setShowButton(!showButton)}>
            <h6>{showButton ? event_obj.name : eventNameParse(event_obj.name)}</h6>
            {event_obj.paid ? <h6>EXTRA COST $$$</h6> : <></>}
            <p className='time'>{start_time} - {event_obj.end}</p>
            <p className='location'>{showButton ? event_obj.location : event_obj.location.split(",")[1]}</p>
            {showButton ? <button className="booking booking-confirm" onClick={() => setShowConfirm(true)}>Create Booking</button> : <></>}
        </div>
        <Modal show={showConfirm} onHide={() => {setShowConfirm(false)}} className="modal-center">
                <Modal.Header closeButton>
                <Modal.Title>{event_obj.name}</Modal.Title>
                </Modal.Header>
                {showLoading ? <LoadingAnimation /> :
                <>
                {otherMembers ? <Modal.Body>Add Additional Members: {otherMembers.map((member, i) => (<div key={i}><input type="checkbox" value={member.id} onChange={e => setMemberCheck(e, member)}/>{member.name}</div>))}</Modal.Body> : <></>}
                <Modal.Footer>
                <button className="booking booking-cancel"onClick={() => {setShowConfirm(false)}}>
                    Cancel
                </button>
                <button className="booking booking-confirm" onClick={() => {confirm()}}>
                    Confirm Booking
                </button>
                </Modal.Footer>
                </>
                }
            </Modal>
        </div>
    )
}

export default EventCard