import { NextResponse } from "next/server";

export async function POST(request: Request){
    // todos in the body of the POST req
    const {todos} = await request.json();
    console.log(todos);

    // communicate with open ai
    
}