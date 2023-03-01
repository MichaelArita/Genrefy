const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  // Will allow connect method to parse the URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Set the name of the DB that our collections are part of
  dbName: 'genrefy'
})
  .then(() => console.log('Connected to Mongo DB.'))
  .catch(err => console.log(err));

const Schema = mongoose.Schema;

// const songSchema = new Schema({
//   _id: String,
//   artist_ID: {
//     type: Schema.Types.ObjectId,
//     ref: 'artists'
//   }
// });

// const Songs = mongoose.model('songs', songSchema);

const artistSchema = new Schema({
  _id: String,
  genre_ID: {
    type: Schema.Types.ObjectId,
    ref: 'genres'
  }
});

const Artists = mongoose.model('artists', artistSchema);

const genreSchema = new Schema({
  // _id = arbitrary given by mongoose itself
  name: String,
});

const Genre = mongoose.model('genres', genreSchema);

module.exports = {
  Artists,
  Genre
};