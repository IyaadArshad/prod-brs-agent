import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  let params;
  try {
    params = await request.json();
    if (!params.overview || !params.file_name) {
      return Response.json({ code: 400, message: "overview and file_name are required" });
    }
  } catch (error) {
    return Response.json({ code: 400, message: "Invalid JSON payload" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ code: 500, message: "Missing OpenAI API key" });
  }

  const overview = params.overview;
  const file_name = params.file_name;
  
  console.log("PARAM OVERVIEW", overview)
  console.log("PARAM FILENAME", file_name)

  const file_contents_fetch = await fetch(
    `https://brs-agent.datamation.lk/api/generative/functions/read_file?file_name=${file_name}`
  );
  const file_contents = await file_contents_fetch.json();

  const Sysprompt = `
  
  You are a BRS document editor. 
  You receive change requests and the current document content. 
  You must implement only the requested changes while preserving all existing content unless explicitly asked to modify it. 
  Each screen must maintain the format: 
  H2 heading (numbered), 
  optional description, diagram section, 
  and extra data section.  

For your reference, this is the current document content:
"${file_contents.data}"

Please update the document following these requirements:
1. Keep the existing document structure
2. Only make changes specified in the overview
3. Maintain all existing content unless explicitly asked to change/remove it
4. Return the complete updated document

Extra Important things to follow:
5. Do not prefix any part of the BRS with a heading (Example: DO NOT PUT DESCRIPTION OR TITLE BEFORE THE TEXT)
6. Diagrams are code blocks containing JSON "{"brsDiagram": {}" Do not modify this blank diagram template. `;

const prompt = `
Hello, please make these changes:
${overview}
`;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: [
            {
              text: Sysprompt,
              type: "text",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "version_response",
          schema: {
            type: "object",
            required: ["newVersion"],
            properties: {
              newVersion: {
                type: "string",
                description:
                  "Updated version of the document with changes the user requested implemented",
              },
            },
            additionalProperties: false,
          },
          strict: true,
        },
      },
      temperature: 0.7,
      max_completion_tokens: 10000,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // just publish a new version
    const messageContent = response.choices[0].message.content;
    if (messageContent === null) {
      throw new Error("Response message content is null");
    }

    console.log(response);


    const content = JSON.parse(messageContent);

    // put the new version number in a constant, just the integer
    
    const publishNewVersion = await fetch("https://brs-agent.datamation.lk/api/data/publishNewVersion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name, data: content.newVersion }),
    });
    const publishNewVersionResponse = await publishNewVersion.json();

    const latestVersion = publishNewVersionResponse.latestVersion;

    return Response.json({
      code: 200,
      message: "Successfully updated the document",
      latestVersion,
    });
  } catch (error) {
    return Response.json({ code: 500, message: error });
  }
}