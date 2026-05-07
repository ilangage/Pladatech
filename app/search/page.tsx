import type { Metadata } from "next";
import ShopShell from "@/components/ShopShell";
import { loadProducts } from "@/lib/product-catalog";
import SearchClient from "./SearchClient";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | Pladatech",
  description: "Search Pladatech smart cleaning, kitchen, pet, car and mobile essentials.",
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await loadProducts();

  return (
    <ShopShell>
      <section className="subpage section-card">
        <SearchClient products={products} initialQuery={params.q ?? ""} />
      </section>
    </ShopShell>
  );
}
