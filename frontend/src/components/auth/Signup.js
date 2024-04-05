import React, {useState} from 'react';
import styles from './Signup.module.scss';

export const Signup = () => {;
    const [user, setUser] = useState()
  return (
    <div className={styles.root}>
        <h2>Signup Here</h2>
        <input type="text" placeholder="Enter your first name" onChange={(event) => {
            setUser({...user, firstName: event.target.value});
        }} />
        <input type="text" placeholder="Enter your last name" onChange={(event) => {
            setUser({...user, lastName: event.target.value});
        }} />
        <input type="text" placeholder="Enter a username" onChange={(event) => {
            setUser({...user, email: event.target.value});
        }} />
        <input type="text" placeholder="Enter a password" onChange={(event) => {
            setUser({...user, email: event.target.value});
        }} />
        <input type="email" placeholder="Enter your email" onChange={(event) => {
            setUser({...user, email: event.target.value});
        }} />
        <button onClick={() => console.log('signup', user)}>Signup</button>
    </div>
  );
}