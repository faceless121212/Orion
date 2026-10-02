import { CompanyForm } from "@/components/company/company-form";
import { PageHeader } from "@/components/shell/page-header";
import { getRepository } from "@/lib/repository";

export default async function CompanyPage() {
  const settings = await getRepository().getCompanySettings();

  return (
    <>
      <PageHeader description="Centralize the company context and brand guidance every agent should understand." eyebrow="Administration" title="Company" />
      <CompanyForm settings={settings} />
    </>
  );
}
