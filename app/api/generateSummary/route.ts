import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    // todos in the body of the POST req
    const {todos} = await request.json();
    console.log(todos);

    // communicate with open ai
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        n: 1,
        stream: false,
        messages: [
            {
                role: "system",
                content: "When responding, always welcome the user as Brosef and say welcome to the Trello Clone! Limit the response to 200 characters" 
            },
            {
                role: "user",
                content: `Hey, provide a summary of the following todos Count how many todos there are in each category such as To do, in progress and done. Then tell the user to have a productive day! Here's the data: ${JSON.stringify(todos)}`,
            },
        ],
    });

    const {data} = response;
    
    return NextResponse.json(data.choices[0].message);
} 