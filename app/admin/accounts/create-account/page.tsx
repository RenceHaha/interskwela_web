'use client';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const CreateAccountPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [firstname, setFirstName] = useState('');
    const [middlename, setMiddleName] = useState('');
    const [lastname, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission

        // Create an object with the form data
        const data = { email, password, role, firstname, middlename, lastname, suffix, dob, address, contact };
        const payload = {
            ...data,
            action: 'create-users'
        }
        console.log(data);
        try {
            // Make the POST request to the API
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the form data in the body
            });

            const result = await response.json(); // Assume response is JSON
            if (response.ok) {
                // Handle success (e.g., show success message or redirect)
                console.log('Account created successfully', result);
                router.push('/admin/accounts');
                
            } else {
                // Handle errors (e.g., display error message)
                console.error('Error creating account:', result);
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
                    required={true}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Handle input change
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    // required={true}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="role"
                    placeholder="Role"
                    required={true}
                    value={role}
                    onChange={(e) => setRole(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="firstname"
                    placeholder="First name"
                    required={true}
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="middlename"
                    placeholder="Middle name"
                    required={false}
                    value={middlename}
                    onChange={(e) => setMiddleName(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="lastname"
                    placeholder="Last name"
                    required={true}
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="suffix"
                    placeholder="Suffix"
                    required={false}
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)} // Handle input change
                />
                <input
                    type="date"
                    name="dob"
                    required={true}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    required={true}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)} // Handle input change
                />
                <input
                    type="text"
                    name="contact"
                    placeholder="Contact"
                    required={true}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)} // Handle input change
                />
                <button className='bg-blue-500' type="submit">
                    Create
                </button>
            </form>
        </div>
    );
};

export default CreateAccountPage;
