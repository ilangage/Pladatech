import AdminWholesaleBannerForm from "@/components/admin/AdminWholesaleBannerForm";

export default function NewWholesaleBannerPage() {
  const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  return <AdminWholesaleBannerForm mode="create" cloudinaryCloudName={cloudinaryCloudName} />;
}
