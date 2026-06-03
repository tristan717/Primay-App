import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/utils/dbServer";
import { getClientIp } from "@/utils/getClientIp";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logActivity } from "@/lib/activityLogger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { code: 401, success: false, message: "Unauthenticated User." }
      );
    }

    // Verify user is ADMIN
    const { data: userData, error: errUser } = await db
      .from("users")
      .select("role, user_id, f_name, l_name, department, position")
      .eq("clerk_user_id", userId)
      .single();

    if (errUser || !userData?.user_id || userData?.role !== "ADMIN") {
      return NextResponse.json(
        { code: 403, success: false, message: "Unauthorized access." }
      );
    }

    // Initialize model
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const { employeeData, tasks } = await req.json();
    // Build context with employee data

    const prompt = `
        You are an AI Decision Support Assistant for a project management system.

        Your role is to help ADMIN users make better workload and task allocation decisions.

        You are given structured task data about employees, including:
        - task assignments
        - deadlines
        - completion status
        - workload distribution
        - project grouping

        Your responsibilities:
        1. Analyze employee workload and detect imbalances
        2. Identify overworked and underutilized employees
        3. Detect risks (missed deadlines, overdue tasks, bottlenecks)
        4. Provide actionable recommendations for task redistribution
        5. Highlight high-performing and low-performing employees
        6. Identify trends across projects

        Guidelines:
        - Be concise but insightful
        - Use bullet points where helpful
        - Prioritize actionable insights over generic observations
        - Do NOT repeat raw data — summarize it
        - Base conclusions ONLY on the provided data
        - If data is missing, say what is missing

        Output format:
        - 🔍 Key Insights
        - ⚠️ Risks / Issues
        - 💡 Recommendations
        - 📊 Optional Metrics Summary

        \n\n
        this is the tasks data that the admin has access to, please analyze thin then make the response: \n ${JSON.stringify(employeeData, null, 2)}
        \n\n ${JSON.stringify(tasks, null, 2)}
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response.text();

    const clientIp = getClientIp(req);
    await logActivity({
      userId: userData.user_id,
      userName: `${userData.f_name} ${userData.l_name}`,
      role: userData.role,
      position: userData.position,
      department: userData.department,
      activityName: "Generated AI Insights",
      method: "POST",
      ipAdd: clientIp,
      activityJson: {
        userId: userData.user_id,
        data: JSON.stringify(aiResponse)
      },
    });
    return NextResponse.json({
      code: 200,
      success: true,
      message: "AI insights generated successfully.",
      data: { insights: aiResponse },
    });
  } catch (error) {
    console.error("Error in Gemini route:", error.message);
    
    // More specific error handling
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { code: 500, success: false, message: "API key configuration error." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { code: 500, success: false, message: "Failed to generate insights." },
      { status: 500 }
    );
  }
}