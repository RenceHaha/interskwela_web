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
        case 'add-students':
            return await addStudents(body);
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
    const { section_name, students } = body


    if(!section_name){
        return NextResponse.json({error: "Please enter section name"}, {status: 400})
    }
    const connection = await createConnection()
    try{
        await connection.beginTransaction()

        const [sy_id] = await connection.query(
            'SELECT id FROM academic_year ORDER BY id DESC LIMIT 1'
        )

        const [sections] = await connection.query(
            'SELECT * FROM section_students ss JOIN sections s ON s.section_id = ss.section_id WHERE section_name = ? AND school_year_id = ?',
            [section_name, sy_id[0].id]
        )

        if(sections.length > 0){
            return NextResponse.json({error: 'Section already exist!'}, {status: 400})
        }
        

        let sectionId = sections.lenght > 0 ? sections[0].section_id : null

        if(!sectionId){
            const [insertedSection] = await connection.query(
                'INSERT INTO sections (section_name) VALUES (?)',
                [section_name]
            )
            sectionId = insertedSection.insertId
        }
        
        if(!sectionId){
            connection.rollback()
            return NextResponse.json({error: 'Error inserting section'}, {status: 400})
        }


        if(Array.isArray(students) || students.length >= 1){
            const studentRows = students.map(user_id => [sectionId, user_id, sy_id[0].id])
            await connection.query(
                'INSERT INTO section_students (section_id, user_id, school_year_id) VALUES ?',
                [studentRows]
            )
        }

        await connection.commit()

        return NextResponse.json({message: 'Successfully Added New Section!', status: 200})
    }catch(error){
        console.error("Error inserting subject:", error);
        await connection.rollback()
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
        console.error("Error updating section:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

export async function addStudents(body){
    const { section_id, student_ids } = body

    if(!section_id){
        return NextResponse.json({ error: 'section_id is required'}, {status: 200})
    }

    const connection = await createConnection()
    try{
        
        

        return NextResponse.json({message: "Section Updated Successfully!"})
    }catch(error){
        console.error("Error deleting section:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }finally{
        await connection.release()
    }
}

