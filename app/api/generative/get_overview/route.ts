import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ code: 500, message: "Missing OpenAI API key" });
    }

    let params;
    try {
        params = await request.json();
        if (!params.input || !params.file_name) {
            return Response.json({ code: 400, message: "input and file_name are required" });
        }
    } catch (error) {
        return Response.json({ code: 400, message: "Invalid JSON payload" });
    }

    const input = params.input;
    const file_name = params.file_name;

    try {
        // Fetch file contents with better error handling
        const file_contents_fetch = await Promise.race([
            fetch(
                `http://localhost:3000/api/generative/functions/read_file?file_name=${encodeURIComponent(file_name)}`,
                {
                    headers: { 'Cache-Control': 'no-cache' }
                }
            ),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 15000)
            )
        ]) as Response;
        const file_contents = await file_contents_fetch.json();

        if (!file_contents.success) {
            if (file_contents.code === 404) {
                return Response.json({ 
                    code: 404, 
                    message: "File not found" 
                });
            }
            throw new Error(file_contents.message || 'Error reading file');
        }

        if (file_contents.v0) {
            return Response.json({ code: 400, message: "Cannot create prompts for a file with no versions" });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: [
                        {
                            text: "You create prompts for prompting making changes to a document. You will receive the input of the user requesting changes. You will provide back, nothing else but a short sentence starting with \"I'll\" in your point of view in under 30 words explaining what you're going to do (from the point of the view of the receiving the final view), (example: I'll help you do x changes) Then put a new line. Then put a small paragraph saying \"Step by step changes:\" then below, put a numbered list of all the changes that need to be made. Be precise, but each point should not be too long. These steps should be clear and definitive to tell what to do to implement the requested changes. There should not be too many points though. Do not exclude details that the user mentioned. Your main objective with these numbered lists is to provide a prompt on what changes need to be made in a clear manner, understanding of what the user originally wanted, but clearer. Know that you are working in a document creation app for context. Know that your prompt will be visible to the user for understanding purposes and will be given to an artificial intelligence model to complete the task, using internal applications if necessary. Do not mention tasks for the user like \"opening document creation application, save the file, etc.\", just \"Create a new file name \"x.md\" is enough for such things. Make sure to be clear if the user just wants to add more to the file, change a specific section, or to remove entire sections. you must be clear, otherwise, you may accidently create a prompt that deletes part of the document that the user wanted to keep. Note that you should not mention creating files as steps. For your reference, here is what a BRS is like: 'At the topmost section of the document, there is the main heading. A simple, concise H1 title (#) that is 4-5 words (Example: MIS Control Module). A BRS is just a document that consists of different screens. Each screen has 4 sections. The first is the H2 (##) Heading that is the name of the screen. It is numbered, so the heading is prefixed with a 1. or 2. or 3. etc. It is a short 2-6 word of what the title does. If the screen is part of a larger screen (by context), the current smaller section is in brackets. Think carefully about using this. This would be like the users page, but the current screen is that of a new transaction, this would be 'Users (New User)', other examples include 'Sales (List View)', 'Sales Manager (New Transaction)' etc. The second part of a screen is some extra information. It is usually a simple sentence explaining the screen. Use casual language for this one, but don't be unprofessional. usually simple language that gets the point across. This doesn't always need to be there. Most of the time, this second section isn't there anyway. Just keep in mind this exists though. The third section is the diagram. The fourth and last section of every screen is the extra data. There will always be some for of a short 1-2  sentence description in 1 or 2 lines.  This could be adding a table for some same data, tables to specify form field types, bullet points for extra info, etc.  Remember the format of the BRS markdown correctly as outlined above. Strictly follow this.",
                            type: "text"
                        }
                    ]
                },
                {
                    role: "user",
                    content: [
                        {
                            text: `${input} || CONTEXT: THIS IS WHAT THE DOCUMENT LOOKS LIKE ${file_contents.data}`,
                            type: "text"
                        }
                    ]
                }
            ],
            response_format: {
                type: "text"
            },
            temperature: 0.84,
            max_completion_tokens: 10000,
            top_p: 0.89,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        return Response.json({ code: 200, prompt: response.choices[0].message.content });
    } catch (error) {
        console.error('Error in overview generation:', error);
        return Response.json({ 
            code: error && typeof error === 'object' && 'code' in error ? (error as { code: number }).code : 500,
            message: error && typeof error === 'object' && 'message' in error ? (error as { message: string }).message : "Error generating overview",
            error: error instanceof Error ? {
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            } : error
        });
    }
}