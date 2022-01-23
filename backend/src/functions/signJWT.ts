import jwt from 'jsonwebtoken';
import config from '../config/config';
import IUser from '../interfaces/user';

const NAMESPACE = 'Auth';

const signJWT = (
  user: IUser,
  callback: (
    error: Error | null | unknown,
    token: string | null | unknown
  ) => void
): void => {
  var timeSinchEpoch = new Date().getTime();
  var expirationTime =
    timeSinchEpoch + Number(config.server.token.expireTime) * 100000;
  var expirationTimeInseconds = Math.floor(expirationTime / 1000);

  try {
    jwt.sign(
      {
        username: user.username,
      },
      config.server.token.secret,
      {
        issuer: config.server.token.issuer,
        algorithm: 'HS256',
        expiresIn: expirationTimeInseconds,
      },
      (error, token) => {
        if (error) {
          callback(error, null);
        } else if (token) {
          callback(null, token);
        }
      }
    );
  } catch (error) {
    callback(error, null);
  }
};

export default signJWT;
