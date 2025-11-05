'use client';
import React, { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import LinkButton from '@/app/components/link-button';

type Section = {
    section_id: number,
    section_name: string,
}

const SectionPage = () => {
    const [data, setData] = useState<Section[] | null>(null);

    useEffect(()=> {
        async function getData(){
            const res = await fetch('/api/sections', {
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

    async function deleteSection(id: string){
        const res = await fetch('/api/sections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'delete-section', section_id: id})
        })

        const data = await res.json()
        console.log(data)
    }

    return (
        <div>
            <LinkButton href={'/admin/sections/create-section'}>Create New Section</LinkButton>
            {data?.map((section) => 
                <div key={section.section_id} className='mt-4'>
                    <div>Section Name: {section.section_name}</div>
                    <div className='flex gap-2'>
                        <Link href={`/admin/sections/edit-section?section_id=${section.section_id}`} className='bg-yellow-200 py-1 px-3 rounded cursor-pointer'>Edit</Link>
                        <button className='bg-red-400 py-1 px-3 rounded cursor-pointer'
                            onClick={()=> deleteSection(section.section_id.toString())}>
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>

    )
}

export default SectionPage