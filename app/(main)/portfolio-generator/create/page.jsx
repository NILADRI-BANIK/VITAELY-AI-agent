import PortfolioForm from "@/components/portfolio/PortfolioForm";

export default async function CreatePortfolioPage({ searchParams }) {
  const params = await searchParams;
  const portfolioId = params?.id ?? null;
  const template = params?.template ?? null;

  return (
    <div className="container mx-auto py-6">
      <PortfolioForm
        portfolioId={portfolioId}
        defaultTemplate={template}
      />
    </div>
  );
}