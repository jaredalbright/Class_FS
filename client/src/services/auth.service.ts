import axios from "axios";
import { removeEvents } from "./event.service";
import { auth } from "./event.service";


const API_URL = "http://localhost:8000/api/auth/";

export const register = (email: string, password: string) => {
  return axios.post(API_URL + "signup", {
    email,
    password,
  });
};

export const login = async (email: string, password: string) => {
  const response = await axios.post(API_URL + "signin", {
      email,
      password,
    })

    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
      const res = await auth(email);

      return res.data;
    }
};

export const logout = () => {
  localStorage.removeItem("user");
  removeEvents();
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);

  return null;
};