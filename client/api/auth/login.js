import { NextResponse } from 'next/server'
import axios from 'axios';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const body = await req.json();
    
    // Gửi request đến backend API
    const backendUrl = process.env.BACKEND_URL || 'https://giaolien-git-master-cuongcows-projects.vercel.app';
    const response = await axios.post(`${backendUrl}/api/auth/login`, body);
    
    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Server error';
    
    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 