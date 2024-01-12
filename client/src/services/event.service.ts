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

export const addUserEvent = async (event: EventObj, start: string, date: string, email: string, memberID: Array<number>, day: string) => {
  const payload = {
    email: email,
    event: event,
    member_id: memberID,
    start: start,
    date: date,
    day: day
  }
  const response = await axios.post(API_URL + "addUserEvent", payload,   
  { headers: authHeader_LT()})
  if (true) {
    console.log("success");
    // const eventStr = localStorage.getItem("events");
    // if (eventStr) {
    //   let events = JSON.parse(eventStr);
    //   console.log(start);
    //   console.log(events.classes[date][start]);
    //   let event_arr = events.classes[date][start];
    //   event_arr = event_arr.filter((e : any) => (e.event_id == event.event_id))
    //   events.classes[date][start] = event_arr
    //   localStorage.setItem("events", JSON.stringify(events));

    //   const userEventStr = localStorage.getItem("user_events");
    //   if (userEventStr) {
    //     let userEvents = JSON.parse(userEventStr);
    //     let userEvents_arr = userEvents.events;
    //     userEvents.events = userEvents_arr.push(payload);
    //     localStorage.setItem("user_events", JSON.stringify(userEvents));
    //   }
    // }
  }
  else {
    return false;
  }
}

export const getUserEvents = (email: string) => {
  let headers : any = authHeader();
  headers['email'] = email;
  return axios.get(API_URL + 'userEvents', { headers: headers
  })
    .then((response) => {
      if (response.data) {
        localStorage.setItem("user_events", JSON.stringify(response.data));
      }

      return response.data
    });
}

export const getCurrentUserEvents = () => {
  const eventStr = localStorage.getItem("user_events");
  if (eventStr) return JSON.parse(eventStr);

  return null;
}

// TODO MAKE SURE DATE IS GOINGIN
// export const makeRes = () => {
//   console.log(authHeader_LT())
//   return axios.post(API_URL + 'addUserEvent', {
//     email: email,
//     event: event,
//     member_id: memberID
//   },
//   { headers: authHeader_LT() 
//   })
//     .then((response) => {
//       if (response.data.classes) {
//         localStorage.setItem("events", JSON.stringify(response.data));
//       }

//       return response.data
//     });
// }