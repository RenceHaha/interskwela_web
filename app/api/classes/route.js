import { createConnection } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query(`
            SELECT c.*, s.subject_code, s.subject_name, sec.section_name,
                CONCAT(p.firstname, ' ', p.lastname) AS teacher
            FROM classes c
            JOIN subjects s ON c.subject_id = s.subject_id
            JOIN sections sec ON c.section_id = sec.section_id
            JOIN users u ON c.teacher_id = u.user_id
            JOIN personal_info p ON u.user_id = p.user_id
        `);
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}
export async function POST(req){

    const body = await req.json();
    if(!body.action){
        return NextResponse.json({message: 'Please define the action'});
    }

    switch(body.action){
        case 'create-class': return await createClasses(body);
        case 'get-specific-class': return await getSpecificClass(body);
        default: return NextResponse.json({message: 'Action not defined'});
    }
}

async function getSpecificClass(body){
    try {
        const connection = await createConnection();
        const { class_id } = body
        if(!class_id){
            return NextResponse.json({error: "class_id required"}, {status: 400})
        }
        const [rows] = await connection.query(
            `SELECT c.*, TIME_FORMAT(sch.start_time, '%h:%i %p') as start_time, TIME_FORMAT(sch.end_time, '%h:%i %p') as end_time,  s.subject_code, s.subject_name, sec.section_name,
                CONCAT(p.firstname, ' ', p.lastname) AS teacher
            FROM classes c
            JOIN subjects s ON c.subject_id = s.subject_id
            JOIN sections sec ON c.section_id = sec.section_id
            JOIN users u ON c.teacher_id = u.user_id
            JOIN personal_info p ON u.user_id = p.user_id
            JOIN schedules sch ON c.class_id = sch.class_id
            WHERE c.class_id = ?`
        , [class_id]);

        const [students] = await connection.query(
            `SELECT u.user_id, firstname, middlename, lastname, suffix 
            FROM class_students cs 
            JOIN users u ON u.user_id = cs.user_id 
            JOIN personal_info pi ON pi.user_id = cs.user_id
            WHERE class_id = ?`,
            [class_id]
        )

        const res = {
            ...rows[0],
            students: students
        }
        connection.release();
        return NextResponse.json(res);
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}

async function createClasses(body){
    const {subject_id, teacher_id, section_id, class_code, description} = body
    const {schedule} = body

    const connection = await createConnection()
    await connection.beginTransaction()
    try{
        
        const [createClass] = await connection.query(
            'INSERT INTO classes (subject_id, section_id, teacher_id, class_code, description) VALUES (?,?,?,?,?)',
            [subject_id, section_id, teacher_id, class_code, description]
        )

        const classID = createClass.insertId

        if(!classID || classID === undefined){
            connection.rollback()
            return NextResponse.json({error: 'Error inserting class'}, {status: 400})
        }
        
        
        if(schedule && typeof schedule === "object"){
            const scheduleRows = []

            for (const day of Object.keys(schedule)){
                const item = schedule[day];

                if(!item.start_time || !item.end_time) continue;

                scheduleRows.push([
                    classID,
                    day.toLowerCase(),
                    item.start_time,
                    item.end_time
                ])
            }

            if(scheduleRows.length > 0){
                await connection.query(
                    'INSERT INTO schedules (class_id, day, start_time, end_time) VALUES ?',
                    [scheduleRows]
                )
            }
        }

        await connection.commit()
        return NextResponse.json({message: "Class successfully created", class_id: classID})
    }catch(e){
        await connection.rollback()
        console.error("Error creating classes: ", e)
        return NextResponse.json({ error: "Error Creating Classes" }, {status: 500})
    }finally{
        await connection.release()
    }
}