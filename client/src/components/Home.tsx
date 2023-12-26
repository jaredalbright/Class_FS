import React, { useState, useEffect } from 'react'
import Schedule from './Schedule'
import { Navigate } from 'react-router-dom'
import IUser from '../types/user.type'
import Events from './events/Events'
import { getCurrentUser } from './../services/auth.service';
import { auth, getCurrentEvents, getEvents } from '../services/event.service';

interface Event {
    classes: Object
}


const Home = () : JSX.Element => {
    const [currentEvents, setCurrentEvents] = useState<Event | undefined>(undefined);

    if (!getCurrentUser()) {
        return <Navigate to="/login" />
    }

    useEffect(() => {
        const events = getCurrentEvents();
        console.log("take1")
        if (events) {
            setCurrentEvents(events);
        }
        else {
            const user = getCurrentUser();
            if (user.x_ltf_profile && user.x_ltf_ssoid) {
                getEvents();
            }
            else {
                auth({email: user.email});
            }
        }

    }, [])

    console.log(currentEvents);
    return (
        <div>
        {currentEvents ? <Events event_obj={currentEvents.classes}/> : <h3> Loading</h3> } 
        </div>
    );
}

export default Home;