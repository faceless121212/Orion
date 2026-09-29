import { CompanyForm } from "@/components/company/company-form";
import { PageHeader } from "@/components/shell/page-header";
import { getCompanySettings } from "@/lib/data/company";

export default async function CompanyPage() {
  const settings = await getCompanySettings();

  return (
    <>
      <PageHeader description="Centralize the company context and brand guidance every agent should understand." eyebrow="Administration" title="Company" />
      <CompanyForm settings={settings} />
    </>
  );
}
