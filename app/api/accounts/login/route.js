import { createConnection } from "@/utils/db";
import { validateRequiredFields } from "@/utils/validateRequiredFields";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
    const body = await req.json();
    const requiredFields = ['email', 'password'];

    // Validate that all required fields are present
    const missingFields = validateRequiredFields(requiredFields, body);
    if (missingFields) {
        return NextResponse.json(
            { error: `Missing required fields: ${missingFields.join(', ')}` },
            { status: 400 }  // Bad Request
        );
    }

    const { email, password } = body;

    const connection = await createConnection();
    try {

        const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        // Check if the user was found
        const fetchedUser = rows[0];
        if (!fetchedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Compare password
        const match = await bcrypt.compare(password, fetchedUser.password);
        if (match) {
            const payload = {
                user_id: fetchedUser.user_id,
                email: fetchedUser.email,
                role: fetchedUser.role,
                date_crerated: fetchedUser.date_created
            }
            const token = jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '1d' }
            );
            console.log('User Logged In:', fetchedUser.user_id, fetchedUser.email, fetchedUser.role);
            return NextResponse.json({ success: true, message: "Login Success!", token, role: fetchedUser.role }, { status: 200 });
        } else {
            return NextResponse.json({ success: true, error: "Failed to login user" }, { status: 401 });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        connection.release();
    }
}
