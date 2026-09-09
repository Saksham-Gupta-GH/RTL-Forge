import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { UserModel } from '@/lib/db/models';

export async function POST(request: Request) {
  try {
    const { action, username, email, password } = await request.json();
    
    if (!username || !password || username.trim().length === 0) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await dbConnect();

    if (action === 'register') {
      if (!email || email.trim().length === 0) {
        return NextResponse.json({ error: 'Email is required for registration' }, { status: 400 });
      }

      // Check if username already exists
      const existingUser = await UserModel.findOne({ username: username.trim() });
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }

      // Create new user
      const newUser = new UserModel({
        username: username.trim(),
        email: email.trim(),
        password: password // For MVP, plaintext. In prod, use bcrypt.
      });

      await newUser.save();
      
      // Return success with sessionId matching username for backward compatibility
      return NextResponse.json({ success: true, sessionId: username.trim() });

    } else if (action === 'login') {
      // Login logic
      const user = await UserModel.findOne({ username: username.trim() });
      
      if (!user) {
        // Fallback for MVP: if they previously used the APP_PASSWORD but never registered,
        // we can allow login with APP_PASSWORD to prevent lock-out, or strictly enforce new registration.
        // Let's enforce strict checking against UserModel, except if they use APP_PASSWORD for a legacy account.
        const expectedPassword = process.env.APP_PASSWORD || 'graphcore';
        if (password === expectedPassword) {
          return NextResponse.json({ success: true, sessionId: username.trim() });
        }
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      if (user.password !== password) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      return NextResponse.json({ success: true, sessionId: username.trim() });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Auth API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
