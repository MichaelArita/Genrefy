const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
require('dotenv').config();

const { mongoDB } = require('../utils/helpers');
const models = require('../models/spotifyModels');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const spotifyController = {};

spotifyController.refreshAccessToken = async (req, res, next) => {
//   console.log(req.cookies);
  try {
    console.log('REFRESHING USER ACCESS TOKEN');

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
      res.locals.access_token = result.access_token;
    }
    
    return next();
  } catch (error) {
    // TODO: Make sure to actually type out this error!
    console.log('error: ', error);
  }
};

spotifyController.getUserslikedSongs = async (req, res, next) => {
  try {
    console.log('GETTING USERS LIKED SONGS');
    const access_token = req.cookies.access_token || res.locals.access_token;
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
        const songData = {
          title: '',
          artists: [],
          link: ''
        };

        // Get all artists
        song.track.artists.forEach(artist => {
          const artistData = {
            // Get artist name
            name: artist.name,
            // Get artist ID
            id: artist.id,
            href: artist.href
            // Get artist genres
          };
  
          songData.artists.push(artistData);
        });
  
        // Get song name
        songData.title = song.track.name;
        // Get song link
        songData.link = song.track.external_urls.spotify;
  
        songs[song.track.id] = songData;
        // songs[song.track.id] = song.track.name;
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

    /* For some reason this breaks my middleware and would like to eventually figure out what's going on
    fs.writeFileSync('songs.json', JSON.stringify(songs, null, 2));
    fs.writeFile('songs.json', JSON.stringify(songs, null, 2), (err) => {
      if (err) throw err;
    });   
    */
    res.locals.likedSongs = songs;
    /**
     *  TESTING LOGIC BELOW
     */
    // res.locals.genres = ['chillhop'];
    // res.locals.genres = ['pop'];
    res.locals.genres = ['k-rap'];
    // res.locals.genres = ['anime', 'j-pixie'];
    return next();
  } catch (error) {
    // TODO: Make sure to actually type out this error!
    console.log('error: ', error);
  }
};

spotifyController.getArtist = async (req, res, next) => {
  try {
    console.log('GETTING ARTISTS');
    const startTime = performance.now();
    
    const access_token = req.cookies.access_token || res.locals.access_token;
    const { likedSongs } = res.locals;
    const { genres } = res.locals;
    const sortedSongs = [];
    
    // // We receive the user's liked songs
    // // Check each song's artist
    // // If the artist already exists in our db, then figure out the songs genre
    // // Otherwise, add the artist to our db, and figre out the songs genre
    // // If the genre matches our genres, then add the song to a new list
    // // return the list through res.locals
    const checkArtists = await models.Artists.find();
    for (const [id, song] of Object.entries(likedSongs)) {
      // console.log('\nID: ', id);
      // console.log('\nTitle: ', song.title);
      let genreList = [];

      for(const artist of song.artists) {
        // console.log('Artist: ', artist);
        // const dbResult = await models.Artists.findOne({_id: artist.id});
        for (const checkArtist of checkArtists) {
          // console.log('\nCheckArtist: ', checkArtist);
          if (checkArtist._id === artist.id) {
            // console.log('Genres: ', Array.isArray(checkArtist.genre_ID));
            genreList = genreList.concat(checkArtist.genre_ID);
            // console.log(`\nGenres: ${checkArtist.genre_ID}\nGenre List: ${genreList}`);
            break;
          }
        }
        // if (dbResult === null) {
        //   const response = await fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
        //     headers: {
        //       'Authorization': 'Bearer ' + access_token
        //     }
        //   });
        //   const result = await response.json();
        //   // console.log('\nresult: ', result);
        //   await mongoDB.addArtist(result);
        //   genreList.concat(result.genres);
        // } else {
        //   // console.log('Just pulling song data');
        //   genreList.concat(dbResult.genre_ID);
        // }
      }

      // console.log(genres);
      // console.log(genreList);      
      for (const genre of genres) {
        if (genreList.includes(genre)) {
          const songData = {
            id,
            title: song.title,
            artistName: [],
          };
          for (const artist of song.artists) {
            songData.artistName.push(artist.name);
          }
          sortedSongs.push(songData);
          break;
        }
      }
      
    }

    console.log('writing to file!');
    // console.log('\n\nSorted Songs:\n\n', sortedSongs);
    fs.writeFileSync('sortedSongs.json', JSON.stringify(sortedSongs, null, 2));
    const endTime = performance.now();
    console.log(`Time taken to sort songs: ${Math.floor((endTime - startTime) / 1000)} seconds` );   
    return next();
  } catch (error) {
    // TODO: Create an actual error here!
    console.log('error: ', error);
  }
};

spotifyController.formatData = async (req, res, next) => {
  // For each song in our liked songs
  // Check what the genre is; find artist in our database and get their genres
  // If the genre matches then save that song's data to a new array which we will use to return 
  try {
    console.log('\nFORMATTING DATA');
    // const access_token = req.cookies.access_token || res.locals.access_token;
    // const { likedSongs } = res.locals;
    // const sortedSongs = [];
    // const access_token = 'BQDhh5m93AVebZF0bdQ55QxYN3U47MVx1XtOvdGeEla1mu4P0OCgvcOAqQq6Hi7PAxrk7pX5xlAi10Sx3ikNVmsUd5LgFlvBh0S6r8dX4-QLxMK2MeE775zCvKGvKrSFanQqTss52T17W46Ij4q5uBRujj_yu_Q6T4bMDPRi9zxeqdIGBmEKk5PySkZwcOupCyRNXNF0nspk';

    // const saved = await fetch('https://api.spotify.com/v1/artists/5555', {
    //   headers: {
    //     'Authorization': 'Bearer ' + access_token
    //   }
    // });
    // const result = await saved.json();
    // console.log(result);

    const result = await models.Artists.findOne({_id: '0k7JZhYS35IewiKNHW7KMj'});
    console.log('\nDATABASE RETURN: ', result);
    return next();
  } catch (error) {
    // TODO: Add an actual error here!
    console.log('ERROR: ', error);
  }


  const { likedSongs } = res.locals;

};
module.exports = spotifyController;

