const models = require('../models/spotifyModels');

const generateRandomStateString = length => {
  let state = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
  for (let i = 0; i < length; i++) {
    state += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return state;
};
const mongoDB = {};

mongoDB.addArtist = async (artists) => {
  try {
    const { id, genres } = artists;
    // console.log('\n\n IN mongoDB: ', id, genres);
    const genreDocuments = [];
  
    for (const genre of genres) {
      const result = await models.Genre.findOneAndUpdate({
        name: genre
      },{
        name: genre
      }, {
        upsert: true,
        new: true
      }).exec();

      genreDocuments.push(genre);
    }
    // const result = await models.Genre.find({name: 'anime'}).exec();
    // console.log(genreDocuments);
    await models.Artists.findOneAndUpdate({
      _id: id
    }, {
      _id: id,
      genre_ID: genreDocuments
    }, {
      upsert: true,
    });
    
  } catch (error) {
    // TODO: Create an actual error
    console.log('error: ', error);
  }
};

// mongoDB.addSong = async (songs) => {
//   try {
    
//   } catch (error) {
//     // TODO: erross!!
//     console.log('error, ', error);
//   }
// };

module.exports = {
  generateRandomStateString,
  mongoDB,

};