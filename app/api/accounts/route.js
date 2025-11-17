import { createConnection } from "@/utils/db";
import { validateRequiredFields } from "@/utils/validateRequiredFields"
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from 'nodemailer';


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
    const requiredFields = ['email', 'role', 'firstname', 'lastname', 'dob', 'address', 'contact' ];

    // Validate that all required fields are present
    const missingFields = validateRequiredFields(requiredFields, body);
    if (missingFields) {
        return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }  // Bad Request
        );
    }
    
    const { email, password, role, firstname, middlename, lastname, suffix, dob, address, contact } = body;
    let generatedPassword
    if(!password){
        generatedPassword = generatePassword(12)
        console.log("--- DEBUGGING SMTP ---");
        console.log("SMTP USER:", process.env.SMTP_USER);
        console.log("SMTP PASS:", process.env.SMTP_PASS ? 'Key is set' : 'Key is UNDEFINED');
        console.log("SMTP HOST:", process.env.SMTP_HOST);
        console.log("----------------------");
        const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        });

        // 3. Define the email options
        const mailOptions = {
        from: `Interskwela - <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your New Password',
        html: `
            <div>
            <h1>Welcome to Interskwela!</h1>
            <p>Your new password is:</p>
            <p><strong>${generatedPassword}</strong></p>
            <p>Please change this password after you log in.</p>
            <p>If you did not apply please ignore this email. Thank you!</p>
            </div>
        `,
        };


        // 4. Send the email
        await transporter.sendMail(mailOptions);
    }
    

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password ?? generatedPassword, salt);
    
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

        
        const [month, day, year] = dob.split('/');
        const formattedDob = `${year}-${month}-${day}`;

        const [insertInfo] = await connection.query(
            'INSERT INTO personal_info (user_id, firstname, lastname, dob, address, contact) VALUES (?, ?, ?, ?, ?, ? )',
            [userID, firstname, lastname, formattedDob, address, contact]
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
        const [rows] = await connection.query('SELECT * FROM users u JOIN personal_info pi ON u.user_id = pi.user_id');
        connection.release();
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

function generatePassword(length = 12) {
  let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}