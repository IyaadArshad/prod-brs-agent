import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});


/**
 * demo input:
 * {
 * "messages": [
 *  {
 *   "role": "user",
 *  "content": "What can you do?"
 * }
 * ]
 * }
 */
async function create_file(file_name: string) {
  const response = await fetch(
    "https://brs-agent.datamation.lk/api/data/createFile",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name }),
    }
  );
  const responseData = await response.json();
  if (!response.ok) {
    console.error(`Failed to create file: ${response.statusText}`);
    return { success: false, error: responseData.message };
  }
  return responseData;
}

async function write_initial_data(file_name: string, data: string) {
  const response = await fetch(
    "https://brs-agent.datamation.lk/api/data/writeInitialData",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name, data }),
    }
  );
  const responseData = await response.json();
  if (!response.ok) {
    console.error(`Failed to write initial data: ${response.statusText}`);
    return { success: false, error: responseData.message };
  }
  return responseData;
}

async function implement_edits(user_inputs: string, file_name: string) {
  const response = await fetch(
    "https://brs-agent.datamation.lk/api/generative/implement_edits",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_inputs, file_name }),
    }
  );

  const responseData = await response.json();
  if (!response.ok) {
    console.error(`Failed to implement overview: ${response.statusText}`);
    return { success: false, error: responseData.message };
  }
  return responseData;
}

async function read_file(file_name: string) {
  const response = await fetch(
    `https://brs-agent.datamation.lk/api/data/readFile?file_name=${file_name}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const responseData = await response.json();
  if (!response.ok) {
    console.error(`Failed to read file: ${response.statusText}`);
    return { success: false, error: responseData.message };
  }
  return responseData;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.messages) {
      return NextResponse.json(
        { error: "messages is required" },
        { status: 400 }
      );
    }
    const { messages: userMessages } = body;

    console.log();
    console.log("Supermodel API Request Called");
    console.log();

    const functionCallLogs: { name: string; arguments: any }[] = [];

    type Message =
      | { role: "system" | "user"; content: string }
      | { role: "function"; name: string; content: string };

    let conversation: Message[] = [
      {
        role: "system",
        content:
          'Create a Business Requirements Specification (BRS) document in markdown format using provided functions. Follow the guidelines to ensure the creation and modification processes are efficient and compliant with specified rules.\n\n' +
          'You will use the functions provided to create and edit BRS documents. Follow a specific sequence of actions:\n' +
          '1. Create a file.\n' +
          '2. Write initial data to it.\n' +
          '3. Implement edits only after obtaining a comprehensive overview of required changes.\n\n' +
          '# Steps\n\n' +
          '- **Creating a File:** Use the `create_file` function to generate the initial .md file. The file should be named professionally with 4-5 words, avoiding underscores and spaces.\n' +
          '- **Writing Initial Data:** Collect necessary input for at least one screen before writing to the file. Ensure the user\'s instructions are accurately reflected, and ask clarifying questions if needed.\n' +
          '- **BRS Structure:**\n' +
          '  - **Title:** Use an H1 heading (4-5 words).\n' +
          '  - **Screens:** Consist of four sections: H2 heading, extra information, diagram, and extra data in a concise manner.\n' +
          '    - **H2 Heading:** Short (2-6 words), with screen numbers like 1., 2., etc. If applicable, include contextual brackets (e.g., "Sales Manager (New Transaction)").\n' +
          '    - **Extra Information:** Casual, explained simply.\n' +
          '    - **Diagram:** Placeholder, not shown to users.\n' +
          '    - **Extra Data:** Tables, bullet points, or short descriptions.\n' +
          '- **Implementing Edits:** Use `implement_edits` to update documents. Always pass user messages unchanged, and summarize changes in natural language rather than displaying markdown.\n\n' +
          '# Output Format\n\n' +
          '- Provide guidance on file creation without displaying the markdown content.\n' +
          '- Summarize edit changes instead of showing any direct content or previews.\n\n' +
          '# Examples\n\n' +
          '**Example 1: Creating a BRS File**\n\n' +
          '_Input:_ "Create a screen called User Profile."\n' +
          '_Output Steps:_\n' +
          '1. Create the file with a professional name: `UserProfileBRS.md`.\n' +
          '2. Ask questions if needed to clarify screen details.\n' +
          '3. Write initial data once satisfied with details for one screen.\n\n' +
          '**Example 2: Implementing Edits**\n\n' +
          '_Input:_ "Add a screen for Order Summary under Sales Management."\n' +
          '_Output Steps:_\n' +
          '1. Implement edits using the exact user message.\n' +
          '2. Provide a summary: "The screen \'Order Summary\' has been added under the \'Sales Management\' section with specified data."\n\n' +
          '# Notes\n\n' +
          '- Always verify the file before providing subsequent answers.\n' +
          '- Facilitate conversations to gather comprehensive input for effective BRS development.\n' +
          '- Ensure all markdown content resides within the files only, and maintain clear, accurate, and professional interaction standards.'
      },
      ...userMessages,
    ];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key" },
        { status: 500 }
      );
    }

    const streamingResponse = new Response(
      new ReadableStream({
        async start(controller) {
          const sendVerbose = (data: any) => {
            // Filter out system messages from conversation logs
            if (data.conversation) {
              data.conversation = data.conversation.filter(
                (msg: any) => msg.role !== "system"
              );
            }
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: "verbose", data })}\n\n`
              )
            );
          };

          while (true) {
            sendVerbose({ message: "Starting OpenAI request", conversation });

            const openAiResponse = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: `gpt-4.5-preview`,
                  messages: conversation,
                  functions: [
                    {
                      name: "create_brs_file",
                      description: "Creates a .md file for the BRS document",
                      parameters: {
                        type: "object",
                        required: ["file_name"],
                        properties: {
                          file_name: { type: "string" },
                        },
                      },
                    },
                    {
                      name: "read_file",
                      description:
                        "Reads the contents of a file. Only use this for your reference and context. Do not display the contents of a file to a user. Read the file whenever the user is asking a question about a file.",
                      parameters: {
                        type: "object",
                        required: ["file_name"],
                        properties: {
                          file_name: { type: "string" },
                        },
                      },
                    },
                    {
                      name: "implement_edits",
                      description:
                        "Update the BRS document with the user's requested changes. Provide the user's inputs",
                      parameters: {
                        type: "object",
                        required: ["user_inputs", "file_name"],
                        properties: {
                          user_inputs: { type: "string" },
                          file_name: { type: "string" },
                        },
                      },
                    },
                    {
                      name: "write_initial_data",
                      description:
                        "Writes initial data for version one for a file. You must call this to write initial data to a .md BRS file",
                      parameters: {
                        type: "object",
                        required: ["file_name", "data"],
                        properties: {
                          data: { type: "string" },
                          file_name: { type: "string" },
                        },
                      },
                    },
                  ],
                  function_call: "auto",
                  temperature: 1.37,
                  max_completion_tokens: 10000,
                  top_p: 0.68,
                  frequency_penalty: 0.35,
                  presence_penalty: 0,
                  stream: false,
                }),
              }
            );

            if (!openAiResponse.ok) {
              const errorText = await openAiResponse.text();
              console.error(`OpenAI error: ${errorText}`);
              throw new Error(`OpenAI error: ${errorText}`);
            }

            const openAiResult = await openAiResponse.json();
            const message = openAiResult.choices[0].message;
            conversation.push(message);

            console.log("OpenAI Response:");
            console.log(message);

            if (message.function_call) {
              const { name, arguments: args } = message.function_call;
              const functionArgs = JSON.parse(args);

              functionCallLogs.push({ name, arguments: functionArgs });

              let functionResult;

              console.log();
              console.log("Function Call:");
              console.log("Name: ", name);
              console.log("Parameters: ", functionArgs);
              console.log();

              // Send "function" chunk
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: "function",
                    data: name,
                    parameters: functionArgs, // Include the function parameters
                  })}\n\n`
                )
              );

              if (name === "create_brs_file") {
                functionResult = await create_file(functionArgs.file_name);
              } else if (name === "write_initial_data") {
                functionResult = await write_initial_data(
                  functionArgs.file_name,
                  functionArgs.data
                );
              } else if (name === "implement_edits") {
                functionResult = await implement_edits(
                  functionArgs.user_inputs,
                  functionArgs.file_name
                );
              } else if (name === "read_file") {
                functionResult = await read_file(functionArgs.file_name);
              } else {
                console.error(`Function ${name} not found.`);
                throw new Error(`Function ${name} not found.`);
              }

              sendVerbose({
                message: "Function called",
                name,
                arguments: functionArgs,
                result: functionResult,
              });

              // Send "functionResult" chunk
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: "functionResult",
                    data: functionResult,
                  })}\n\n`
                )
              );

              console.log();
              conversation.push({
                role: "function",
                name,
                content: JSON.stringify(functionResult),
              });
            } else {
              const text = message.content || "";
              // Send final "message" chunk
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: "message",
                    content: text,
                  })}\n\n`
                )
              );
              // Send end chunk
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ type: "end" })}\n\n`
                )
              );
              controller.close();
              return;
            }
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
    return streamingResponse;
  } catch (err) {
    console.error("Error in POST handler:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}