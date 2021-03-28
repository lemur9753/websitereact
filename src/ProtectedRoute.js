import React, {useState} from 'react';
import { Route } from 'react-router-dom';

const ProtectedRoute = ({ component: Component,loggedin,handleLogin,loginerror, ...rest }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsername = e => {
    e.preventDefault();
    setUsername(e.target.value)
  }
  const handlePassword = e => {
    e.preventDefault();
    setPassword(e.target.value)
  }

  if(loggedin){
  return (
    <Route {...rest} render={
      props => <Component {...rest} {...props} />
    } />
  )
  }
  else{
    return (
      <div className="login-wrapper">
        <h1>Please log in</h1>
        <form>
          <label>
            Username:
            <input
              type='text'
              name='username'
              onChange={handleUsername}
            />
          </label>
          <br/>
          <label>
            Password:
            <input
              type='password'
              name='password'
              onChange={handlePassword}
            />
          </label>
          <br/>
        </form>
        <button onClick={() => handleLogin(username, password)}>
            Submit
        </button>
        <p>
          {loginerror}
        </p>
      </div>
    );
  }
}

export default ProtectedRoute