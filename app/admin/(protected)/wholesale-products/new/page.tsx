import AdminWholesaleProductForm from "@/components/admin/AdminWholesaleProductForm";

export default function NewWholesaleProductPage() {
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleProductForm mode="create" cloudinaryCloudName={cloudinaryCloudName} />;
}
