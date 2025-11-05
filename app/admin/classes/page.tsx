'use client'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import Link from 'next/link';

interface Class {
    class_id: number;
    subject_id: number;
    section_id: number;
    teacher_id: number;
    subject_code: number;
    subject_name: string;
    section_name: string;
    teacher: string;
}

const ClassesPage = () => {

    const [classes, setClasses] = useState<Class[] | null>(null)  
    const router = useRouter()
    useEffect(()=> {
        async function getClasses(){
            const res = await fetch('/api/classes')
            const data = await res.json()
            setClasses(data)
        }
        getClasses()
    },[])

    console.log(classes)

    return (
        <div>
            <h1>Classes</h1>
            <Link href={'/admin/classes/create-class'}>Create New Class</Link>
            <div className='flex gap-2 m-3'>
                {classes?.map((_) => 
                    <div key={_.class_id} className='mb-4 p-3 border rounded cursor-pointer'
                        onClick={()=> {
                            router.push(`/admin/classes/view-class?class_id=${_.class_id}`)
                        }}
                    >
                        <h1 className='font-bold text-base'>{_.subject_code + " - " + _.subject_name}</h1>
                        <p className='font-normal text-sm'>{_.section_name}</p>
                        <p className='font-normal text-sm'>{_.teacher}</p>
                    </div>
                )}
            </div>
            
        </div>
    )
}

export default ClassesPage