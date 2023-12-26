

export function authHeader() {
        const userStr = localStorage.getItem("user");
        let user = null;
        if (userStr)
          user = JSON.parse(userStr);
      
        if (user && user.accessToken) {
          return { 'x-access-token': user.accessToken };
        } else {
          return { 'x-access-token': null }; 
        }
    }

export function authHeader_LT() {
        const userStr = localStorage.getItem("user");
        let user = null;
        if (userStr) user = JSON.parse(userStr);
        if (user && user.accessToken && user.x_ltf_profile && user.x_ltf_ssoid) {
          return { 'x-access-token': user.accessToken, 'x_ltf_profile': user.x_ltf_profile, 'x_ltf_ssoid': user.x_ltf_ssoid};
        } else {
          return { 'x-access-token': null, 'x_ltf_profile': null, 'x_ltf_ssoid': null}; 
        }
}
