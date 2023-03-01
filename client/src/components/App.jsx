import React, { Component } from 'react';
import { Routes, Route } from 'react-router';


class App extends Component {
  render() {
    return(
      <div>
        <Route
          exact
          path='/'
          element= <h1> Hello world! Testing Testing </h1>
                  //  <a href='/login' className='btn btn-primary'>Log in with Spotify</a>
                  //  <a href='/test' className='test'>Next page</a>
        />
        {/* <Route
          exact
          path='/next'
          // element= <a href='/test'>Hello World!</a>
        /> */}

      </div>
    );
  }
}

export default App;