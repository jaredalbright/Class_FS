import axios from 'axios';
import {authHeader, authHeader_LT} from './auth.header';

const API_URL = 'http://localhost:8000/api/events/';

// TODO ADD CHECK FOR AUTH EXP
export const auth = (email : string) => {
    const data = {"email": email};
    return axios.post(API_URL + 'auth', data, { headers: authHeader()})
    .then((response) => {
      if (response.data.x_ltf_profile && response.data.x_ltf_ssoid) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.x_ltf_profile = response.data.x_ltf_profile;
          userObj.x_ltf_ssoid = response.data.x_ltf_ssoid;
          localStorage.setItem("user", JSON.stringify(userObj));
        }

        return response.data;
      }
    });
  }

export const getEvents = () => {
    return axios.get(API_URL + 'events', { headers: authHeader_LT() 
    })
      .then((response) => {
        if (response.data.classes) {
          localStorage.setItem("events", JSON.stringify(response.data));
        }

        return response.data
      });
  }

export const getCurrentEvents = () => {
  const eventStr = localStorage.getItem("events");
  if (eventStr) return JSON.parse(eventStr);

  return null;
}

export const removeEvents = () => {
  localStorage.removeItem("events");
}
interface EventObj {
  name: string,
  event_id: string,
  end: string,
  location: string,
  paid: boolean
}

interface Member {
    name: string,
    id: number
}

export const addUserEvent = async (event: EventObj, start: string, date: string, email: string, memberID: Array<number>, day: string, otherMembers: Array<Member>) => {
  const payload = {
    email: email,
    event: event,
    member_id: memberID,
    start: start,
    date: date,
    day: day,
    other_members: otherMembers
  }
  const response = await axios.post(API_URL + "addUserEvent", payload,   
  { headers: authHeader_LT()})
  if (response.status == 201) {
    console.log("success");
    return true;
  }
  else {
    return false;
  }
}

export const deleteUserEvent = async (event_id: string, email: string) => {
  let headers : any = authHeader();
  headers['event_id'] = event_id;
  headers['email'] = email;
  console.log(headers);
  const response = await axios.delete(API_URL + "removeUserEvent",   
  {headers: headers})
  if (response.status == 202) {
    console.log("success");
    return true;
  }
  else {
    return false;
  }
}

export const getUserEvents = async (email: string) => {
  let headers : any = authHeader();
  headers['email'] = email;
  const response = await axios.get(API_URL + 'userEvents', { headers: headers
  })
  if (response.data) {
    localStorage.setItem("user_events", JSON.stringify(response.data));
    return response.data;
  }
  return false;
}

export const removeUserEvents = () => {
  localStorage.removeItem("user_events");
}

export const getCurrentUserEvents = () => {
  const eventStr = localStorage.getItem("user_events");
  if (eventStr) return JSON.parse(eventStr);

  return null;
}
