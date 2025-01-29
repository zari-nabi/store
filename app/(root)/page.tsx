import ProductList from "@/components/shared/product/product-list";
// import sampleData from "@/db/sample-data";
import { getLatestProducts } from "@/lib/actions/product.actions";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const Home = async () => {
  const latestProducts = await getLatestProducts();
  return (
    <div className="space-y-8">
      <h2 className="h2-bold">Latest Products</h2>
      <ProductList title="Newest Arrivals" data={latestProducts} limit={4} />
    </div>
  );
};

export default Home;
