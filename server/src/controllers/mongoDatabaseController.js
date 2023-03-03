const models = require('../models/spotifyModels');

const mongoDBController = {};

mongoDBController.addArtist = async (req, res, next) => {
  try {
    const { id, genres } = res.locals.artist;
    console.log('\n\n IN mongoDB: ', id, genres);
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

      genreDocuments.push(result);
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
  
    return next();
    
  } catch (error) {
    // TODO: Create an actual error
    console.log('error: ', error);
  }
};

module.exports = mongoDBController;