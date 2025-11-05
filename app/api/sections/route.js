import { createConnection } from "@/utils/db";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const connection = await createConnection();

        const [rows] = await connection.query('SELECT * FROM sections')
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching section:", error);
        return NextResponse.json({ error: "Failed to fetch section" }, { status: 500 })
    }
}

export async function POST(req) {
    
    const body = await req.json();
    if(!body.action){
        return NextResponse.json({message: 'Please define the action'});
    }

    switch(body.action){
        case 'create-section': 
            return await createSection(body);
        case 'get-section-by-id':
            return await getSectionById(body);
        case 'update-section':
            return await updateSection(body);
        case 'delete-section':
            return await deleteSection(body);
        default:
            return NextResponse.json({message: 'Action not defined'});
    }

}

export async function getSectionById(body){
    const { section_id } = body
    if(!section_id){
        return NextResponse.json({error: "section_id is required"}, {status: 400})
    }
    const connection = await createConnection()

    try{
        const [section] = await connection.query(
            'SELECT * FROM sections WHERE section_id = ?',
            [section_id]
        )

        if(section.length > 0){
            return NextResponse.json(section)
        }
        return NextResponse.json({message: 'Section not found'})

    }catch(error){
        console.error("Error getting section:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function createSection(body){
    const { section_name } = body
    if(!section_name){
        return NextResponse.json({error: "Please enter section name"}, {status: 400})
    }
    const connection = await createConnection()
    try{
        const [subjects] = await connection.query(
            'SELECT * FROM sections WHERE section_name = ?',
            [section_name]
        )

        if(subjects.length > 0){
            return NextResponse.json({message: 'Section Already Exists!'})
        }

        await connection.query(
            'INSERT INTO sections (section_name) VALUES (?)',
            [section_name]
        )
        return NextResponse.json({message: 'Successfully Added New Section!', status: 200})
    }catch(error){
        console.error("Error inserting subject:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function deleteSection(body){
    
    const { section_id } = body
    if(!section_id){
        return NextResponse.json({ error: 'section_id is required'}, {status: 200})
    }
    const connection = await createConnection()

    try{
        await connection.query(
            'DELETE FROM sections WHERE section_id = ?',
            [section_id]
        )

        return NextResponse.json({message: 'Successfully deleted a section'}, {status: 200})
    }catch(error){
        console.error("Error deleting section:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function updateSection(body){
    const { section_id, section_name} = body

    if(!section_id){
        return NextResponse.json({ error: 'section_id is required'}, {status: 200})
    }

    const connection = await createConnection()
    try{
        const result = await connection.query(
            'UPDATE sections SET section_name = ? WHERE section_id = ?',
            [section_name, section_id]
        )

        if(result.affectedRows === 0){
            return NextResponse.json({ message: 'No changes made'})
        }
        return NextResponse.json({message: "Section Updated Successfully!"})
    }catch(error){
        console.error("Error deleting section:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}