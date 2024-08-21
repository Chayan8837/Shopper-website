import React, { useState } from 'react';
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setformData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setformData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
  };

  const login = async () => {
    const response = await fetch("https://shopper-website.onrender.com/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
    const result = await response.json();
    console.log(result);

    if (result.success) {
      localStorage.setItem('auth-token', result.token);
      window.location.replace("/");
    } else {
      alert(result.errors);
    }
  };

  const signup = async () => {
    console.log(formData);

    const response = await fetch("https://shopper-website.onrender.com/signup", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    console.log(result);

    if (result.success) {
      localStorage.setItem('auth-token', result.token);
      window.location.replace("/");
    } else {
      alert(result.errors);
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{isSignup ? 'Sign up' : 'Login'}</h1>
        <div className="loginsignup-fields">
          {isSignup ? (
            <>
              <input value={formData.username} type="text" placeholder='Your name' name='username' onChange={changeHandler} />
              <input value={formData.email} type="email" placeholder='Email Address' name='email' onChange={changeHandler} />
              <input value={formData.password} type="password" placeholder='Password' name='password' onChange={changeHandler} />
              <button onClick={signup}>Continue</button>
              <p className='loginsignup-login'>Already have an account? <span onClick={toggleForm}>Login here</span></p>
              <div className="loginsignup-agree">
                <input type="checkbox" id="check" />
                <p>By continuing, I agree to the terms of use & privacy policy</p>
              </div>
            </>
          ) : (
            <>
              <input value={formData.email} type="email" placeholder='Email Address' name='email' onChange={changeHandler} />
              <input value={formData.password} type="password" placeholder='Password' name='password' onChange={changeHandler} />
              <button onClick={login}>Login</button>
              <p className='loginsignup-login'>Don't have an account? <span onClick={toggleForm}>Sign up here</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
