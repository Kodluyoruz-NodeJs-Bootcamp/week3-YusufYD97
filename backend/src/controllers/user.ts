import { NextFunction, Request, Response } from 'express';
import bcryptjs, { hash } from 'bcryptjs';
import signJWT from '../functions/signJWT';
import { Connect, Query } from '../config/mysql';
import IUser from '../interfaces/user';
import IMySQLResult from '../interfaces/result';

const NAMESPACE = 'User';

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(200).json({
    message: 'Authorized',
  });
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  let { username, password } = req.body;

  console.log('req', req);
  console.log('res', res);

  bcryptjs.hash(password, 10, (hashError, hash) => {
    if (hashError) {
      return res.status(500).json({
        message: hashError.message,
        error: hashError,
      });
    }

    const query = `INSERT INTO users (username, password) VALUES ("${username}", "${hash}")`;

    Connect()
      .then((connection) => {
        Query<IMySQLResult>(connection, query)
          .then((result) => {
            return res.status(201).json(result);
          })
          .catch((error) => {
            return res.status(500).json({
              message: error.message,
              error,
            });
          });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          error,
        });
      });
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  let { username, password } = req.body;

  let query = `SELECT * FROM users WHERE username = '${username}'`;

  Connect()
    .then((connection) => {
      Query<IUser[]>(connection, query)
        .then((users) => {
          bcryptjs.compare(password, users[0].password, (error, result) => {
            if (error) {
              return res.status(401).json({
                message: error.message,
                error,
              });
            } else if (result) {
              signJWT(users[0], (_error, token) => {
                if (_error) {
                  return res.status(401).json({
                    message: 'Unable to Sign JWT',
                    error: _error,
                  });
                } else if (token) {
                  return res.status(200).json({
                    message: 'Auth Successful',
                    token,
                    user: users[0],
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          return res.status(500).json({
            message: error.message,
            error,
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  let query = `SELECT id, username, date_joined FROM users`;

  Connect().then((connection) => {
    Query<IUser[]>(connection, query)
      .then((users) => {
        return res.status(200).json({
          users,
          count: users.length,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          error,
        });
      });
  });
};

export default { validateToken, register, login, getAllUsers };
