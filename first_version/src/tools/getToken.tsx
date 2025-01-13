import { Cookie } from "universal-cookie";
import { jwtDecode } from "jwt-decode";

const getToken = (cookies: Cookie) => {
  const token = cookies.get("token");

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let decodedToken;

  try {
    decodedToken = jwtDecode<{ name: string; id: string }>(token);
  } catch (error) {
    return {
      window: {
        location: "/login",
      },
    };
  }

  return {
    token: token,
    phone: decodedToken.name,
    userId: decodedToken.id,
  };
};

export default getToken;
