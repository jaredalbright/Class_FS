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
    console.log(authHeader_LT())
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

// TODO MAKE SURE DATE IS GOINGIN
export const makeRes = () => {
  console.log(authHeader_LT())
  return axios.post(API_URL + 'addUserEvent', { headers: authHeader_LT() 
  })
    .then((response) => {
      if (response.data.classes) {
        localStorage.setItem("events", JSON.stringify(response.data));
      }

      return response.data
    });
}