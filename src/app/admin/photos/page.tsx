import { PhotoManager } from "@/components/admin/PhotoManager";
import { listPhotos } from "@/lib/db";

export const metadata = { title: "Photos" };

export default async function PhotosPage() {
  const photos = await listPhotos();
  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Photos</h1>
      <PhotoManager photos={photos} />
    </div>
  );
}
