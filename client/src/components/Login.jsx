import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const navigate = useNavigate();

  return(
    <>
      <h1> Hello world! Testing Testing </h1>
      <a href='/spotify' className='btn btn-primary'>Log in with Spotify</a>
      <a href='/spotify/users-liked-songs' className='test'>Next page</a>
      <button type='button' onClick={(e) => navigate('/test')}>Test Page</button>
    </>
  );
};