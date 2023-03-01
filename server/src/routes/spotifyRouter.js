const express = require('express');
const querystring = require('querystring');

const spotifyController = require('../controllers/spotifyController');
const { generateRandomStateString } = require('../utils/helpers');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:3000/spotify/callback';

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
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
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
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        }), 
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
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
      res.redirect('http://localhost:8080');
    }
  } catch (error) {
    console.log('err: ', error);
  }
});

router.get('/users-liked-songs', spotifyController.refreshAccessToken, spotifyController.getUserslikedSongs, (req, res) => {
  res.status(200).redirect('http://localhost:8080');
});

module.exports = router;