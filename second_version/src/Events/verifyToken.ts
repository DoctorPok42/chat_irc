import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET ="secret";

const verifyToken = (data: any, callback: any) => {
    const { token } = data;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        callback({ success: true, message: 'Token is valid' });
        console.log('Token is valid');
    } catch (error) {
        callback({ success: false, message: 'Token is invalid' });
        console.error('Token is invalid');
    }
}

export default verifyToken;