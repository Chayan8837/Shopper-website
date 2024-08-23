import React, { useState } from 'react';
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });
  const [error, setError] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleForm = () => {
    setIsSignup(!isSignup);
    setError(""); // Reset error when toggling form
  };

  const handleSubmit = async () => {
    const endpoint = isSignup ? "signup" : "login";
    const response = await fetch(`https://shopper-website.onrender.com/${endpoint}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (result.success) {
      localStorage.setItem('auth-token', result.token);
      window.location.replace("/");
    } else {
      setError(result.errors || "An error occurred. Please try again.");
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || (isSignup && !formData.username)) {
      setError("All fields are required");
      return false;
    }
    return true;
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{isSignup ? 'Sign up' : 'Login'}</h1>
        <div className="loginsignup-fields">
          {error && <p className="error-message">{error}</p>}
          {isSignup ? (
            <>
              <input 
                value={formData.username} 
                type="text" 
                placeholder='Your name' 
                name='username' 
                onChange={changeHandler} 
              />
              <input 
                value={formData.email} 
                type="email" 
                placeholder='Email Address' 
                name='email' 
                onChange={changeHandler} 
              />
              <input 
                value={formData.password} 
                type="password" 
                placeholder='Password' 
                name='password' 
                onChange={changeHandler} 
              />
              <button onClick={() => validateForm() && handleSubmit()}>Continue</button>
              <p className='loginsignup-login'>Already have an account? <span onClick={toggleForm}>Login here</span></p>
              <div className="loginsignup-agree">
                <input type="checkbox" id="check" />
                <p>By continuing, I agree to the terms of use & privacy policy</p>
              </div>
            </>
          ) : (
            <>
              <input 
                value={formData.email} 
                type="email" 
                placeholder='Email Address' 
                name='email' 
                onChange={changeHandler} 
              />
              <input 
                value={formData.password} 
                type="password" 
                placeholder='Password' 
                name='password' 
                onChange={changeHandler} 
              />
              <button onClick={() => validateForm() && handleSubmit()}>Login</button>
              <p className='loginsignup-login'>Don't have an account? <span onClick={toggleForm}>Sign up here</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
