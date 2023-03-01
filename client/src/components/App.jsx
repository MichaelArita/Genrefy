import React, { Component } from 'react';
import { Switch, Route } from 'react-router';



class App extends Component {
  render() {
    return(
      <div className='router'>
        <h1> Hello world! Testing Testing </h1>
        <a href='/spotify' className='btn btn-primary'>Log in with Spotify</a>
        <a href='/spotify/users-liked-songs' className='test'>Next page</a>
      </div>
    );
  }
}

export default App;