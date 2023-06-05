const express = require('express');
const querystring = require('querystring');
const path = require('path');

const spotifyController = require('../controllers/spotifyController');
const mongoDBController = require('../controllers/mongoDatabaseController');
const { generateRandomStateString } = require('../utils/helpers');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/spotify/callback';

const stateKey = 'spotify_auth_state';

const router = express.Router();

// Handle logins through spotify from the front end
router.get('/', (req, res) => {
  const state = generateRandomStateString(16);
  res.cookie(stateKey, state);  // Used to protect against CSRF attacks, check on line 38 that there was no tampering with our request.
  const scope = 'user-read-private user-read-email user-library-read';
  res.redirect('https://accounts.spotify.com/authorize?' + // Redirect to spotify's login portal for oAuth 2.0 authentication; To receive authorization_code and state.
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    }));
});

router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    console.log('storedState', storedState);
    if (state === null || state !== storedState) {
      res.redirect('/#' + 
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: querystring.stringify({
          code: code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        }), 
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
          'Content-type': 'application/x-www-form-urlencoded'
        },
      });
      const result = await response.json();
      console.log (result);
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000
      });

      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: true,
      });
      res.redirect('http://localhost:8080/test'); // Used for react
      // res.status(200).sendFile(path.join(__dirname, '../../../client/src/landingPage.html'));  // Used for testing; implementation before react
    }
  } catch (error) {
    // TODO: Write out an actual error here!!
    console.log('err: ', error);
  }
});

router.get('/users-liked-songs', spotifyController.getUserslikedSongs, (req, res) => {
  // res.status(200).redirect('http://localhost:8080');
  // res.sendStatus(200);
  console.log('USERS LIKED SONGS: ', res.locals.likedSongs);
  res.status(200).sendFile(path.join(__dirname, '../../../client/src/landingPage.html'));
});

router.get('/testing-path', spotifyController.refreshAccessToken, (req, res) => {
  res.status(200).redirect('http://localhost:8080/test');
});

router.get('/create-playlist', spotifyController.refreshAccessToken, spotifyController.getUserslikedSongs, spotifyController.getArtist, (req, res) => {
  // console.log(res.locals.likedSongs);
  res.status(200).redirect('/sorted-songs-playlist');
});

module.exports = router;