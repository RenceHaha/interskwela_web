import { createConnection } from "@/utils/db";
import { validateRequiredFields } from "@/utils/validateRequiredFields"
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


export async function POST(req) {

    const body = await req.json();
    const { action } = body
    if(!action ){
        return NextResponse.json({error: "action is required!"})
    }

    switch(action){
        case 'create-users': return await createUsers(body)
        case 'get-teachers': return await fetchTeachers()
        case 'get-students': return await fetchStudents()
        default: return NextResponse.json({error: 'Action not found'})
    }
}

async function createUsers(body){
    const requiredFields = ['email', 'password', 'role', 'firstname', 'lastname', 'dob', 'address', 'contact' ];

    // Validate that all required fields are present
    const missingFields = validateRequiredFields(requiredFields, body);
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }  // Bad Request
        );
    }
    
    const { email, password, role, firstname, middlename, lastname, suffix, dob, address, contact } = body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const connection = await createConnection();
    await connection.beginTransaction();

    try{
        const [rows] = await connection.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );

        if(rows.affectedRows < 0){
            await connection.rollback();
            return NextResponse.json({ error: "Failed to create user", query: 1}, { status: 500 });
        }

        const userID = rows.insertId;
        if(!userID){
            await connection.rollback();
            return NextResponse.json({ error: "Failed to get user id"}, { status: 404} );
        }

        const [insertInfo] = await connection.query(
            'INSERT INTO personal_info (user_id, firstname, lastname, dob, address, contact) VALUES (?, ?, ?, ?, ?, ? )',
            [userID, firstname, lastname, dob, address, contact]
        )

        if(insertInfo.affectedRows < 0){
            await connection.rollback();
            return NextResponse.json({ error: "Failed to create user", query: 2},  { status : 500 });
        }

        if(middlename || middlename !== ''){
            await connection.query(
                'UPDATE personal_info SET middlename = ? WHERE user_id = ?',
                [middlename, userID]
            );
        }

        if(suffix || suffix !== ''){
            await connection.query(
                'UPDATE personal_info SET suffix = ? WHERE user_id = ?',
                [suffix, userID]
            );
        }

        await connection.commit();
        return NextResponse.json({ message: "Successfully added a user!" }, {status : 200});

    }catch(error){
        await connection.rollback();
        console.error("Error inserting user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }finally{
        await connection.release();
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

export async function GET() {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query('SELECT * FROM users');
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}