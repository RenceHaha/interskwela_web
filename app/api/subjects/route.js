import { createConnection } from "@/utils/db";
import { validateRequiredFields } from "@/utils/validateRequiredFields"
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const connection = await createConnection();

        const [rows] = await connection.query('SELECT * FROM subjects')
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
    }
}

export async function POST(req) {
    
    const body = await req.json();
    if(!body.action){
        return NextResponse.json({error: 'Please define the action'}, {status: 500});
    }

    switch(body.action){
        case 'create-subject': 
            return await createSubject(body);
        case 'get-subject-by-id':
            return await getSubjectById(body);
        case 'update-subject':
            return await updateSubject(body);
        case 'delete-subject':
            return await deleteSubject(body);
        default:
            return NextResponse.json({message: 'Action not defined'});
    }

}

export async function getSubjectById(body){
    const requiredFields = ['subject_id']

    const missingFields = validateRequiredFields(requiredFields, body)
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
        );
    }
    
    const { subject_id } = body
    const connection = await createConnection()

    try{
        const [subjects] = await connection.query(
            'SELECT * FROM subjects WHERE subject_id = ?',
            [subject_id]
        )

        if(subjects.length > 0){
            return NextResponse.json(subjects)
        }
        return NextResponse.json({message: 'Subject not found'})

    }catch(error){
        console.error("Error getting subject:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function createSubject(body){
    const requiredFields = ['subject_name', 'subject_code', 'description']

    const missingFields = validateRequiredFields(requiredFields, body)
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
        );
    }
    
    const { subject_name, subject_code, description } = body
    const connection = await createConnection()

    try{
        const [subjects] = await connection.query(
            'SELECT * FROM subjects WHERE subject_name = ?',
            [subject_name]
        )

        if(subjects.length > 0){
            return NextResponse.json({message: 'Subject Already Exists!'})
        }

        await connection.query(
            'INSERT INTO subjects (subject_name, subject_code, description) VALUES (?,?,?)',
            [subject_name, subject_code, description]
        )

        return NextResponse.json({message: 'Successfully Added New Subject!', status: 200})


    }catch(error){
        console.error("Error inserting subject:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function deleteSubject(body){
    const requiredFields = ['subject_id']

    const missingFields = validateRequiredFields(requiredFields, body)
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
        );
    }
    
    const { subject_id } = body
    const connection = await createConnection()

    try{
        await connection.query(
            'DELETE FROM subjects WHERE subject_id = ?',
            [subject_id]
        )

        return NextResponse.json({message: 'Successfully deleted a subject'}, {status: 200})
    }catch(error){
        console.error("Error deleting subject:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function updateSubject(body){
    const requiredFields = ['subject_id']

    const missingFields = validateRequiredFields(requiredFields, body)
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
        );
    }
    
    const { subject_id, subject_name, subject_code, description } = body
    const connection = await createConnection()

    const fieldsToUpdate = {}
    const params = []

    if(subject_name !== undefined){
        fieldsToUpdate.subject_name = subject_name
        params.push(subject_name)
    }
    if(subject_code !== undefined){
        fieldsToUpdate.subject_code = subject_code
        params.push(subject_code)
    }
    if(description !== undefined){
        fieldsToUpdate.description = description
        params.push(description)
    }

    if(Object.keys(fieldsToUpdate).length === 0){
        return NextResponse.json({ message: 'No fields provided to update'})
    }

    const setClause = Object.keys(fieldsToUpdate).map(key => `\`${key}\` = ?`).join(', ')

    params.push(subject_id)


    try{
        const result = await connection.query(
            `UPDATE subjects SET ${setClause} WHERE subject_id = ?`,
            params
        )

        if(result.affectedRows === 0){
            return NextResponse.json({ message: 'No changes made'})
        }
        return NextResponse.json({message: "Subject Updated Successfully!"})
    }catch(error){
        console.error("Error deleting subject:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}