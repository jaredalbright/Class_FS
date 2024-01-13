import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const parseJwt = (token:any) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const AuthVerify = (props:any) => {
  let location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem("user")

    if (user) {
        const user_json = JSON.parse(user);

        if (user_json) {
          const decodedJwt = parseJwt(user_json.accessToken);
    
          if (decodedJwt.exp * 1000 < Date.now()) {
            props.logOut();
          }
        }

    }
  }, [location, props]);

  return <></>;
};

export default AuthVerify;