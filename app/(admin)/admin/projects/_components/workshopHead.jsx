"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AxiosInstance from "@/utils/axios";
import { useEffect, useState } from "react";
import { MapPin, Calendar, User, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WorkshopHeader({ id }) {
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await AxiosInstance.post(`/project_task`, { id });
                if (response?.data?.success && response.data?.projectData) {
                    setProjectData(response.data.projectData);
                }
            } catch (error) {
                console.error("Failed to fetch project:", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchProject();
    }, [id]);


    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return "Invalid Date";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "LOW":
                return "bg-green-100 text-green-800 border border-green-300";
            case "MID":
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case "HIGH":
                return "bg-red-100 text-red-800 border border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-300";
        }
    };

    const getStatusIcon = (status) => {
        if (status) return <CheckCircle className="w-5 h-5 text-green-500" />;
        return <Clock className="w-5 h-5 text-blue-500" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-gray-500">Loading project details...</div>
            </div>
        );
    }

    if (!projectData) {
        return (
            <div className="flex items-center gap-2 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800">Project data not found</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Card className="border-0 pt-4! gap-2! shadow-lg bg-linear-to-br from-lime-200/20 to-mist-100 rounded-lg">
                <CardHeader className="pb-2! border-b border-gray-300">
                    <div className="flex flex-row align-items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row align-items-center gap-3">
                                <label className="text-2xl md:text-4xl font-bold text-gray-900">
                                    {projectData.project_name}
                                </label>
                                <Badge className={`${getPriorityColor(projectData.priority)} w-8 md:my-2 rounded-md`}>
                                    {projectData.priority ?? "Unknown"}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 md:mt-1">
                            {getStatusIcon(projectData.status)}
                            <span className="text-sm font-medium text-gray-700">
                                {projectData.status ? "Finished" : "Not finish"}
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-3">
                    <div className="grid grid-cols-2 gap-2 md:grid md:grid-cols-2 lg:grid-cols-4">
                        {/* Project Lead */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4 text-lime-500" />
                                <span className="text-sm font-medium">Project Lead</span>
                            </div>
                            <p className="text-sm md:text-base text-gray-900 font-semibold">{projectData.lead_name}</p>
                        </div>

                        {/* Duration */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-lime-500" />
                                <span className="text-sm font-medium">Duration</span>
                            </div>
                            <div className=" text-sm text-gray-900">
                                <p className="text-sm md:text-base font-semibold">{formatDate(projectData.duration_from)}</p>
                                <p className="text-sm md:text-base font-semibold">to {formatDate(projectData.duration_to)}</p>
                            </div>
                        </div>

                        {/* Location */}
                        {projectData.project_loc && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-lime-500" />
                                    <span className="text-sm font-medium">Location</span>
                                </div>
                                <p className="text-sm md:text-base text-gray-900 font-semibold">{projectData.project_loc}</p>
                            </div>
                        )}

                        {/* Created Date */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="w-4 h-4 text-lime-500" />
                                <span className="text-sm font-medium">Created</span>
                            </div>
                            <p className="text-sm md:text-base text-gray-900 font-semibold ">{formatDate(projectData.createdAt)}</p>
                        </div>
                    </div>

                    {/* Full Description */}
                    <div className="mt-3 border-t border-gray-300">
                        <h3 className="text-base font-semibold text-gray-700 mt-3 mb-1">Project Description</h3>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                            {projectData.desc}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
