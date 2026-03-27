import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
  const form = await req.formData();
  const file = form.get('file');
  if (!file) return Response.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'terceirao' }, (err, res) => {
      if (err) reject(err); else resolve(res);
    }).end(buffer);
  });
  return Response.json({ url: result.secure_url });
}