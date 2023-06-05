const express = require('express');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const fetch = require('node-fetch');
const fs = require('fs');
const { dir } = require('console');
const path = require('path');
const { query } = require('express');
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/callback';
const PORT = 3000;

const generateRandomStateString = (length) => {
  let state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < length; i++) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return state;
};

let stateKey = 'spotify_auth_state';

const app = express();
const spotifyRouter = require('./routes/spotifyRouter');

app.use(express.json())
   .use(cookieParser());

app.get('/sorted-songs-playlist', (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, '../../client/src/sortedSongs.html'));
});

app.get('/send-file', (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, '../../sortedSongs.json'));
});

app.get('/landing-page', (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, '../../client/src/landingPage.html'));
});
    
app.use('/spotify', spotifyRouter);
    
// app.get('/login', (req, res) => {
app.get('/', (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, '../../client/src/login.html'));
});

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: {err: 'An error unknown occured'},
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  // fs.appendFileSync('error log.txt', ) // Maybe try this: https://www.loggly.com/ultimate-guide/access-and-error-logs/
  return res.sendStatus(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});