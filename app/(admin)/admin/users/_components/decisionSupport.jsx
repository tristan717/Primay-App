"use client";

import { useEffect, useState } from "react";
import AxiosInstance from "@/utils/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Astroid, Loader2 } from "lucide-react";

export default function DecisionSupport({ employeeData }) {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);

  const generateInsights = async () => {
    setLoading(true);
    setError("");
    setInsights("");

    try {
      const response = await AxiosInstance.post("/gemini", {
        tasks,
        employeeData,
      });

      if (response.data.success) {
        setInsights(response.data.data.insights);
      } else {
        setError(response.data.message || "Failed to generate insights");
      }
    } catch (err) {
      setError(err.message || "An error occurred while generating insights");
      console.error("Gemini request error:", err);
    } finally {
      setLoading(false);
    }
  };

    async function fetchTaskEmployee(){
        const response = await AxiosInstance.get("/all_task");

        if(response){
            if(response.data){
                const res = response.data;
                if(res.code === 200 && res.success === true){
                    setTasks(res.tasks)
                }
            }
        }
    }

    useEffect(() => {
        async function loadData(){
            await fetchTaskEmployee();
        }
        loadData();
    }, [])

  return (
    <div className="pt-4">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>AI Decision Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateInsights}
            disabled={loading}
            className="w-full rounded-md linear animate-gradient bg-linear-to-r from-lime-400 via-sky-400 to-purple-500 hover:from-lime-500 hover:via-sky-600 hover:to-purple-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <span className="flex flex-row gap-1"><Astroid /> Generate AI Insights</span>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded border border-red-300">
              {error}
            </div>
          )}

          {insights && (
            <div className="p-4 bg-lime-50 rounded-md border border-lime-200 whitespace-pre-wrap">
              {insights}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}