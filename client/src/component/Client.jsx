import React from 'react';
import Avatar from "react-avatar";

function Client({ username }) {
  if (!username) return null; 
  return (
    <div className='d-flex align-items-center mb-3'>
      <Avatar
       name={String(username)}
        size={50}
        round="14px"
        className='mr-3'
      />
      <span className='mx-2'>{username}</span>
    </div>
  );
}

export default Client; 
