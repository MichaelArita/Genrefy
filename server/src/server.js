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

// app.get('/', (req, res) => {
//   return res.status(200).sendFile(path.join(__dirname, '../../client/src/index.html'));
// });

app.use('/spotify', spotifyRouter);

// app.get('/login', (req, res) => {
//   const state = generateRandomStateString(16);
//   res.cookie(stateKey, state);
//   // console.log('Login state: ', state);
//   const scope = 'user-read-private user-read-email user-library-read';
//   console.log('\n\nIn login\n\n');
//   console.log(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET);
//   res.redirect('https://accounts.spotify.com/authorize?' + 
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scope,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });

// app.get('/callback', async (req, res) => {
//   try {
//     // console.log('\n\nIn callback\n\n');
//     const code = req.query.code || null;
//     const state = req.query.state || null;
//     const storedState = req.cookies ? req.cookies[stateKey] : null;
//     console.log('storedState', storedState);
//     if (state === null || state !== storedState) {
//       res.redirect('/#' + 
//         querystring.stringify({
//           error: 'state_mismatch'
//         }));
//     } else {
//       res.clearCookie(stateKey);
//       const response = await fetch('https://accounts.spotify.com/api/token', {
//         method: 'POST',
//         body: querystring.stringify({
//           code: code,
//           redirect_uri: redirect_uri,
//           grant_type: 'authorization_code'
//         }), 
//         headers: {
//           'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
//           'Content-type': 'application/x-www-form-urlencoded'
//         },
//       });
//       const result = await response.json();
//       console.log (result);
//       res.cookie('access_token', result.access_token, {
//         httpOnly: true,
//         secure: true,
//         maxAge: 3600000
//       });

//       res.redirect('http://localhost:8080');
//     }
//   } catch (error) {
//     console.log('err: ', error);
//   }
// });

app.get('/likedSongs', async (req, res) => {
  
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