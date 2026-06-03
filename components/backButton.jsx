"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const route = useRouter()

    const handleBack = () => {
        route.back()
    }

    return (
        <Button variant="outline" onClick={handleBack} size="sm" className="hover:bg-lime-500 border-black hover:border-none">
            Back
        </Button>
    );
}
