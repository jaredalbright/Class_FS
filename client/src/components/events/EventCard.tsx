import { ChangeEvent, useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getCurrentUser } from './../../services/auth.service';

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

interface Member {
    name: String,
    id: number
}

const EventCard = ({ event_obj, start_time }: Props) => {
    const [showButton, setShowButton] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [otherMembers, setOtherMembers] = useState<Member[] | undefined>(undefined);
    const [checks, setChecks] = useState<boolean[] | undefined>(undefined);
    const [confirmedMembers, setConfirmedMembers] = useState<number[]>([]);

    const checkPlusOne = (text: string) => {
        const index = text.indexOf("Each member that signs up bring 1 member");

        if (index !== -1) {
            return true;
        }
        return false;
    }

    const textParse = (text: string) => {
        let parsed_text = text;
        const plusOne = checkPlusOne(text);

        const range = new RegExp("\\d+\\.\\d+-\\d+\\.\\d+");
        const range_m = text.match(range);

        const above = new RegExp("\\d+\\.\\d+\\+");
        const above_m = text.match(above);

        if (text.toUpperCase().indexOf("ALL LEVELS") !== -1 || text.indexOf("Pickleball Open Play: Drill and Play") !== -1) {
            parsed_text = "All Levels Play"
        }

        if (range_m) {
            parsed_text = "DUPR range: " + range_m[0];
        }
        else if (above_m) {
            parsed_text = "DUPR: " + above_m[0];
        }

        if (text.indexOf("NR") !== -1) {
            parsed_text = parsed_text + " and NR"
        }

        if (plusOne) {
            parsed_text = parsed_text + " (PLUS 1)"
        }

        return parsed_text
    }

    const setMemberCheck = (e: ChangeEvent<HTMLInputElement>,new_member : number) => {
        let addedMembers = confirmedMembers;

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

    const confirm = () => {
        console.log(confirmedMembers);

        setShowConfirm(false);
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
        <div className="event-card event-card-align" onClick={() => setShowButton(!showButton)}>
            <h6>{showButton ? event_obj.name : textParse(event_obj.name)}</h6>
            {event_obj.paid ? <h6>EXTRA COST $$$</h6> : <></>}
            <p className='time'>{start_time} - {event_obj.end}</p>
            <p className='location'>{showButton ? event_obj.location : event_obj.location.split(",")[1]}</p>
            {showButton ? <button onClick={() => setShowConfirm(true)}>Confirm Booking</button> : <></>}
        </div>
        <Modal show={showConfirm} onHide={() => {setShowConfirm(false)}}>
                <Modal.Header closeButton>
                <Modal.Title>{event_obj.name}</Modal.Title>
                </Modal.Header>
                {otherMembers ? <Modal.Body>Add Additional Members: {otherMembers.map((member, i) => (<div key={i}><input type="checkbox" value={member.id} onChange={e => setMemberCheck(e, member.id)}/>{member.name}</div>))}</Modal.Body> : <></>}
                <Modal.Footer>
                <button onClick={() => {setShowConfirm(false)}}>
                    Cancel
                </button>
                <button onClick={() => {confirm()}}>
                    Confirm Booking
                </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default EventCard