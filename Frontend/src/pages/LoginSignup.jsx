import React, { useState } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gmail validation function
  const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const login = async () => {
    console.log("Login Function Executed", formData);

    // Validate Gmail
    if (!isValidGmail(formData.email)) {
      alert("Please use a valid Gmail address (must end with @gmail.com)");
      return;
    }

    let responseData;
    await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.message || "Login failed");
    }
  };

  const signup = async () => {
    console.log("SignUp Function Executed", formData);

    // Validate Gmail
    if (!isValidGmail(formData.email)) {
      alert("Please use a valid Gmail address (must end with @gmail.com)");
      return;
    }

    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.message || "Signup failed");
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input
              name='name'
              value={formData.name}
              onChange={changeHandler}
              type="text"
              placeholder='Your Name'
            />
          ) : null}

          <input
            name="email"
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder='Email Address'
          />

          <input
            name="password"
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder='Password'
          />
        </div>

        <button onClick={() => { state === "Login" ? login() : signup() }}>
          Continue
        </button>

        {state === "Sign Up" ? (
          <p className='loginsignup-login'>
            Already have an account?{" "}
            <span onClick={() => setState("Login")}>Login here</span>
          </p>
        ) : (
          <p className='loginsignup-login'>
            Create an account{" "}
            <span onClick={() => setState("Sign Up")}>Click here</span>
          </p>
        )}

        <div className='loginsignup-agree'>
          <input type='checkbox' />
          <p>
            By continuing, I agree to the terms of use & privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
