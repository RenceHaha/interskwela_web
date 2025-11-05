'use client'
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

interface Class {
    class_id: number;
    subject_id: number;
    section_id: number;
    teacher_id: number;
    class_code: number;
    subject_code: number;
    subject_name: string;
    section_name: string;
    description: string;
    start_time: string;
    end_time: string;
    teacher: string;
    students: Student[];
}

interface Student {
    user_id: number;
    firstname: string;
    middlename: string;
    lastname: string;
    suffix: string;
}

const ViewClassPage = () => {

    const [classObj, setClass] = useState<Class | null>(null)
    const searchParams = useSearchParams();
    const class_id = searchParams.get('class_id');

    useEffect(()=>{
        async function getData(){
            const res = await fetch('/api/classes',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'get-specific-class', class_id: class_id})
            })
            const data = await res.json()
            
            console.log(data)
            setClass(data)
        }
        getData()
    },[class_id])

    return (
        <>
            <div>ViewClassPage</div>
            <div className='mt-4'>
                <p>Class Code: {classObj?.class_code}</p>
                <p>Subject: {classObj?.subject_code + " - " + classObj?.subject_name}</p>
                <p>Description: {classObj?.description}</p>
                <p>Schedule: {classObj?.start_time} - {classObj?.end_time}</p>
                <p>Teacher: {classObj?.teacher}</p>
                <p className='mt-3'>List of Students</p>
                {classObj?.students?.map((student) => 
                    <div key={student.user_id}>
                        {student.firstname + ' ' + student.lastname}
                    </div>
                )}
            </div>
        </>
    )
}

export default ViewClassPage