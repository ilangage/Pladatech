import { notFound } from "next/navigation";
import AdminWholesaleProductForm from "@/components/admin/AdminWholesaleProductForm";
import { getAdminWholesaleProductById } from "@/lib/admin-wholesale-products";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditWholesaleProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getAdminWholesaleProductById(id);
  if (!product) notFound();
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleProductForm mode="edit" product={product} cloudinaryCloudName={cloudinaryCloudName} />;
}
