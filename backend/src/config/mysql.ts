import mysql from 'mysql';
import config from './config';

const params = {
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.database,
  host: config.mysql.host,
};

const Connect = async () => {
  return new Promise<mysql.Connection>((resolve, reject) => {
    const connection = mysql.createConnection(params);

    connection.connect((error) => {
      if (error) {
        console.log('mysql_error', error);
        reject(error);
        return;
      }
      console.log('mysql_connection', connection);

      resolve(connection);
    });
  });
};

const Query = async <T>(connection: mysql.Connection, query: string) => {
  return new Promise<T>((resolve, reject) => {
    connection.query(query, connection, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);

      connection.end();
    });
  });
};

export { Connect, Query };
