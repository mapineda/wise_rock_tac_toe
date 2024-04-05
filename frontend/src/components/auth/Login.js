import React, {useState} from 'react';
import styles from './Login.module.scss';

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className={styles.root}>
        <h2>Login Here</h2>
        <input type="email" placeholder="Enter your email" onChange={(event) => setEmail(event.target.value)}/>
        <input type="password" placeholder="Enter your password" onChange={(event) => setPassword(event.target.value)}/>
        <button>Login</button>
    </div>
  );
}