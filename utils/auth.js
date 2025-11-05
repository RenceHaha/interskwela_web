import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

export function verifyAuthToken(request) {
  // 1. Get the token from the Authorization header
  // App Router uses the native Request object headers
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1]; // Expects 'Bearer <token>'

  if (!token) {
    return { error: 'No token provided' };
  }

  try {
    // 2. Verify and decode the token
    const decoded = jwt.verify(token, SECRET);

    // 3. Return the decoded user payload
    return { user: decoded };
  } catch (err) {
    // Token is invalid, expired, etc.
    return { error: 'Invalid or expired token' };
  }
}