import {} from 'dotenv/config'
import express from 'express';
import twitter from './twitter'

// This is here because Heroku needs a port to connect to
const app = express();

const server = app.listen(process.env.PORT || 3000, () => {
  const {address, port} = server.address();
  console.log(`listening on http://${address}:${port}`);
});
