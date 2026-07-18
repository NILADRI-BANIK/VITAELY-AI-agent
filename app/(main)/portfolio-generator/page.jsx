import { getAllPortfolios } from "@/actions/portfolio";
import PortfolioDashboard from "./_components/portfolio-dashboard";

export default async function PortfolioGeneratorPage() {
  const portfolios = await getAllPortfolios();

  return (
    <div className="container mx-auto py-6">
      <PortfolioDashboard initialPortfolios={portfolios} />
    </div>
  );
}