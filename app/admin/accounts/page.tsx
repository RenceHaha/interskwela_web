'use client';
import React, { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';

type Users = {
    user_id: number,
    email: string,
    role: string,
    date_created: string
}

const AccountsPage = () => {
    const [data, setData] = useState<Users[] | null>(null);

    useEffect(()=> {
        async function getData(){
            const res = await fetch('/api/accounts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await res.json();
            setData(data);
        }
        
        getData();
    }, []);

    return (
        <div>
            <Link href={'/admin/accounts/create-account'}>Create New Account</Link>
            {data?.map((account) => 
                <div key={account.user_id} className='mb-4'>
                    <div>Email: {account.email}</div>
                    <div>Role: {account.role}</div>
                    <div>Date Created: {account.date_created}</div>
                </div>
            )}
        </div>

    )
}

export default AccountsPage