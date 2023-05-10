import React, { Component } from 'react';
import { Routes, Route } from 'react-router';

import { Login } from './Login.jsx';
import { Navbar } from './Navbar.jsx';

class App extends Component {
  render() {
    return(
      <>
        {/* <div className='router'>
          <h1> Hello world! Testing Testing </h1>
          <a href='/spotify' className='btn btn-primary'>Log in with Spotify</a>
          <a href='/spotify/users-liked-songs' className='test'>Next page</a>
        </div> */}
        <Navbar/>
        <Routes>
          <Route path='/' element={ <Login/>}/>

        </Routes>
      </>
    );
  }
}

export default App;