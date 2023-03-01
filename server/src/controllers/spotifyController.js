const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyController = {};

spotifyController.refreshAccessToken = async (req, res, next) => {
//   console.log(req.cookies);
  try {
    const { access_token, refresh_token } = req.cookies;
    console.log(`access_token: ${access_token}\nrefresh_token: ${refresh_token}`);
    if (!access_token) {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        }),
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'Content-type': 'application/x-www-form-urlencoded'
        },
      });
      const result = await response.json();
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000
      });
    }
    
    return next();
  } catch (error) {
    // TODO: Make sure to actually type out this error!
    console.log('error');
  }
};

spotifyController.getUserslikedSongs = async (req, res, next) => {
  try {
    const { access_token } = req.cookies;
    let response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
    let result = await response.json();
    // Storing the raw data
    // fs.writeFileSync('songs.json', JSON.stringify(result, null, 2));

    // console.log(result);
    // console.log(result.total);
    const totalLikedSongs = result.total;
    const songs = {};
    let count = 50;

    for (let songsLeft = totalLikedSongs; songsLeft > 0; songsLeft -= 50) {
      result.items.forEach(song => {
        // const songData = {
        //   title: '',
        //   artists: [],
        //   link: ''
        // }

        // // Get all artists
        // song.track.artists.forEach(artist => {
        //   const artistData = {
        //     // Get artist name
        //     name: artist.name,
        //     // Get artist ID
        //     id: artist.id,
        //     href: artist.href
        //     // Get artist genres
        //   };
  
        //   songData.artists.push(artistData);
        // });
  
        // // Get song name
        // songData.title = song.track.name;
        // // Get song link
        // songData.link = song.track.external_urls.spotify;
  
        // songs[song.track.id] = songData;
        songs[song.track.id] = song.track.name;
      });

      if (songsLeft > 50) {
        response = await fetch(`https://api.spotify.com/v1/me/tracks?offset=${count}&limit=50`, {
          headers: {
            'Authorization': 'Bearer ' + access_token
          }
        });
        result = await response.json();
        console.log('In The For Loop: ', result);
        count += 50;
      }
    }

    fs.writeFileSync('songs.json', JSON.stringify(songs, null, 2));   
    res.redirect('http://localhost:8080');

    return next();
  } catch (error) {
    // TODO: Make sure to actually type out this error!
    console.log('error');
  }
};

module.exports = spotifyController;