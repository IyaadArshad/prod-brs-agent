export async function POST(request: Request) {
  let user_inputs;
  let file_name;
  try {
    ({ user_inputs, file_name } = await request.json());
    if (!user_inputs || !file_name) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "user_inputs and file_name are required",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid JSON payload" }),
      { status: 400 }
    );
  }

  console.log();
  console.log();
  console.log("SUBFUNCTION HAS BEEN CALLED -> IMPLEMENT EDITS");
  console.log();

  const verbose = {
    timestamp: new Date().toISOString(),
    route: "implement_edits",
    inputs: { user_inputs, file_name },
  };

  let overview;

  // get an overview
  try {
    const overviewResponse = await fetch("https://brs-agent.datamation.lk/api/v2/models/getOverview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: user_inputs,
        file_name: file_name,
      }),
    });
    
    if (!overviewResponse.ok) {
      const errorText = await overviewResponse.text();
      console.error(`Failed to get overview: ${errorText}`);
      throw new Error(`Overview API returned status ${overviewResponse.status}: ${errorText}`);
    }
    
    overview = await overviewResponse.json();
    
    if (!overview || !overview.prompt || !overview.file_contents) {
      throw new Error("Overview API returned incomplete data");
    }
  } catch (error) {
    console.error("Error getting overview:", error);
    // Return an error response
    return Response.json({
      success: false,
      message:
        "Failed to generate an implementation plan: " + (error instanceof Error ? error.message : String(error)),
    });
  }

  console.log("GENERATED OVERVIEW / IMPLEMENTATION PLAN");
  console.log("Overview: ", overview);

  // implement that overview

  try {
    const implemented_overview = await fetch(
      "http://localhost:3000/api/v2/models/implementOverview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overview: overview.prompt,
          file_name: file_name,
          file_contents: overview.file_contents
        }),
      }
    );
    
    if (!implemented_overview.ok) {
      const errorText = await implemented_overview.text();
      console.error(`Failed to implement overview: ${errorText}`);
      throw new Error(`Implementation API returned status ${implemented_overview.status}: ${errorText}`);
    }
    
    const implemenent_overview_json = await implemented_overview.json();
    const latestVersion = implemenent_overview_json.latestVersion;

    console.log("IMPLEMENTED OVERVIEW");
    console.log("Implementation: ", implemented_overview);
    return Response.json({
      success: true,
      overview: overview,
      message:
        "Display the overview of what was implemented to the user in a message, without changing it at all. The edits have successfully been made to the file",
      file_name: file_name,
      latestVersion: latestVersion,
      verbose: verbose, // Add verbose data to response
    });
  } catch (error) {
    return Response.json({
      success: false,
      message:
        "Successfully generated an implementation plan, but was unable to implemenent it",
    });
  }
}