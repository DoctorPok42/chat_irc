import jwt, { JwtPayload } from "jsonwebtoken";

const verifyToken = (data: any, callback: any) => {
  const { token } = data;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    callback({ success: true, message: "Token is valid" });
    console.log("Token is valid");
  } catch (error) {
    callback({ success: false, message: "Token is invalid" });
    console.error("Token is invalid");
  }
};

export default verifyToken;
