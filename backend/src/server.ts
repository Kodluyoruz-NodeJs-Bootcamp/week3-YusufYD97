import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import config from './config/config';
import userRoutes from './routes/user';

const NAMESPACE = 'Server';
const app = express();

/** Log the request */
app.use((req, res, next) => {
  /** Log the req */
  console.log(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  next();

  res.on('finish', () => {
    /** Log the res */
    console.log(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });
});

/** Parse the body of the request */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/** Rules of our API */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  if (req.method == 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  next();
});

/** Routes go here */
app.use('/users', userRoutes);

/** Error handling */
app.use((req, res, next) => {
  const error = new Error('Not found');

  res.status(404).json({
    message: error.message,
  });
});

const httpServer = http.createServer(app);

httpServer.listen(config.server.port, () =>
  console.log(
    NAMESPACE,
    `Server is running ${config.server.hostname}:${config.server.port}`
  )
);
