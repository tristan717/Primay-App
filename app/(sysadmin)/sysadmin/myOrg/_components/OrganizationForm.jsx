"use client";
import { PageHeader } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AxiosInstance from "@/utils/axios";
import { Building2, Save } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function OrganizationForm({ organization, mode = "setup" }) {
  const router = useRouter();
  const isSetup = mode === "setup";
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rOnly, setROnly] = useState(false)
  const pathname = usePathname();

  useEffect(() => {
    if(pathname.startsWith("/sysadmin/myOrg")){
      setROnly(true)
    }
  },[setROnly])
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    console.log("sent payload: ", payload)
    const response = await AxiosInstance.post("/organization", {payload})

    console.log('response: ', response)
    if(response){
      setIsSaving(false);
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(result.message ?? "Unable to save organization details.");
      return;
    }

    router.refresh();
    router.push("/sysadmin");
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        eyebrow={isSetup ? "Required setup" : "My company"}
        title={isSetup ? "Company Registration" : "Company Profile"}
        description={
          isSetup
            ? "This setup is required before the system workspace is available. The company profile is needed to access the services of Primary."
            : "Maintain the organization details used across the Primary platform."
        }
      />

      <form onSubmit={handleSubmit} className="rounded-md border border-zinc-200 bg-white p-6">

        <div className="mb-5 flex items-center gap-3 border-b border-zinc-100 pb-5">
          <div className="flex size-10 items-center justify-center rounded-md bg-lime-100 text-lime-700">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-950">Organization information</h2>
            <p className="text-sm text-zinc-500">Fields marked with an asterisk are required.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-bold uppercase text-zinc-500">Company name <label className="text-red-500">*</label></span>
            <Input name="company_name" readOnly={rOnly} required defaultValue={organization?.company_name ?? ""} placeholder="Primary Project Management" />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-zinc-500">Industry <label className="text-red-500">*</label></span>
            <Input readOnly={rOnly} name="industry" required defaultValue={organization?.industry ?? ""} placeholder="Project operations" />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-zinc-500">Company email <label className="text-red-500">*</label></span>
            <Input readOnly={rOnly} name="email_company" type="email" required defaultValue={organization?.email_company ?? ""} placeholder="primary@company.com" />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-zinc-500">Contact number <label className="text-red-500">*</label></span>
            <Input readOnly={rOnly} name="contact_company" type="number" required defaultValue={organization?.contact_company ?? ""} placeholder="0000 - 000 - 0000" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-zinc-500">Company location <label className="text-red-500">*</label></span>
            <Input readOnly={rOnly} name="company_loc" defaultValue={organization?.company_loc ?? ""} placeholder="Calamba City, Laguna" />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-bold uppercase text-zinc-500">Company details</span>
            <Textarea readOnly={rOnly} name="company_details" defaultValue={organization?.company_details ?? ""} placeholder="Briefly describe the organization and the teams using Primary." />
          </label>
        </div>

        {message && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {message}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving} className={`bg-lime-400 text-white hover:bg-zinc-800 ${rOnly ? `hidden` : ``}`}>
            <Save className="size-4" />
            {isSaving ? "Saving" : isSetup ? "Submit" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
