'use client';
import React, { useState, FormEvent } from 'react';

const CreateAccountPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission

        // Create an object with the form data
        const data = { email, password };
        
        try {
            // Make the POST request to the API
            const response = await fetch('/api/accounts/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Send the form data in the body
            });

            const result = await response.json(); // Assume response is JSON
            if (response.ok) {
                // Handle success (e.g., show success message or redirect)
                console.log('Login success!', result);
            } else {
                // Handle errors (e.g., display error message)
                console.error('Error:', result);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Handle input change
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Handle input change
                />
                <button className='bg-blue-500' type="submit">
                    Login\`````````````````````
                    `
                </button>
            </form>
        </div>
    );
};

export default CreateAccountPage;
