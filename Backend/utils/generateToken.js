import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'inisio_secure_jwt_secret_token_2026_greenfield';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'inisio_secure_jwt_secret_token_2026_greenfield';
  return jwt.verify(token, secret);
};

export default generateToken;
