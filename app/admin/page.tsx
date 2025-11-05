
import React from 'react'
import LinkButton from '@/app/components/link-button'

const AdminPage = () => {


  return (
    <div className='flex flex-col gap-2'>
        <LinkButton href={'/admin/accounts'}>Accounts</LinkButton>
        <LinkButton href={'/admin/sections'}>Sections</LinkButton>
        <LinkButton href={'/admin/subjects'}>Subjects</LinkButton>
        <LinkButton href={'/admin/classes'}>Classes</LinkButton>
    </div>
  )
}

export default AdminPage