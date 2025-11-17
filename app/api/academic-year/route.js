import { createConnection } from "@/utils/db";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query('SELECT * FROM academic_year');
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching academic year:", error);
        return NextResponse.json({ error: "Failed to fetch academic year" }, { status: 500 });
    }
}

export async function POST(req) {

    const body = await req.json();
    const { action } = body
    if(!action ){
        return NextResponse.json({error: "action is required!"})
    }

    switch(action){
        case 'create-new': return await createUsers(body)
        case 'update': return await fetchTeachers()
        case 'delete': return await fetchStudents()
        default: return NextResponse.json({error: 'Action not found'})
    }
}

async function fetchTeachers(){
    const connection = await createConnection();
    try{
        const [teachers] = await connection.query(
            'SELECT * FROM users u JOIN personal_info pi ON u.user_id = pi.user_id WHERE role = ?',
            ['teacher']
        )
        console.log(teachers)
        return NextResponse.json(teachers)
    }catch(e){
        console.error("Error fetching teachers: ", e)
        return NextResponse.json({error: "Error fetching teachers"}, {status: 500})
    }finally{
        connection.release()
    }
}

async function fetchStudents(){
    const connection = await createConnection()
    try{
        const [students] = await connection.query(
            'SELECT * FROM users u JOIN personal_info pi ON u.user_id = pi.user_id WHERE role = ?',
            ['student']
        )

        console.log(students)
        return NextResponse.json(students)
    }catch(e){
        console.error("Error fetching students", e)
        return NextResponse.json({error: "Error fetching students"}, {status: 500})
    }finally{
        connection.release()
    }
}
