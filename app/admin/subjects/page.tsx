'use client';
import React, { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import LinkButton from '@/app/components/link-button';

type Subjects = {
    subject_id: number,
    subject_name: string,
    subject_code: string,
    description: string
}

const SubjectPage = () => {
    const [data, setData] = useState<Subjects[] | null>(null);

    useEffect(()=> {
        async function getData(){
            const res = await fetch('/api/subjects', {
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

    async function deleteSubject(id: string){
        const res = await fetch('/api/subjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'delete-subject', subject_id: id})
        })

        const data = await res.json()
        console.log(data)
    }

    return (
        <div>
            <LinkButton href={'/admin/subjects/create-subject'}>Create New Subject</LinkButton>
            {data?.map((subject) => 
                <div key={subject.subject_id} className='mt-4'>
                    <div>Subject Code: {subject.subject_code}</div>
                    <div>Subject Name: {subject.subject_name}</div>
                    <div>Description: {subject.description}</div>
                    <div className='flex gap-2'>
                        <Link href={`/admin/subjects/edit-subject?subject_id=${subject.subject_id}`} className='bg-yellow-200 py-1 px-3 rounded cursor-pointer'>Edit</Link>
                        <button className='bg-red-400 py-1 px-3 rounded cursor-pointer'
                            onClick={()=> deleteSubject(subject.subject_id.toString())}>
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>

    )
}

export default SubjectPage