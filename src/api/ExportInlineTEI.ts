import { createServerSDK } from '@recogito/studio-sdk';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, params, cookies }) => {
  const projectId = params.projectId;
  const documentId = params.documentId;

  if (!projectId || !documentId)
    // Should never happen
    throw new Error('Missing project or document ID');

  const sdk = await createServerSDK(request, cookies, import.meta.env);

  // 1. Check basic access permissions
  const { error: profileError, data: profile } = await sdk.profile.getMyProfile();
  if (profileError || !profile)
    return new Response(JSON.stringify({ error: 'Not authorized' }));

  const hasSelectPermissions = await sdk.project.hasSelectPermissions(profile, projectId);
  if (!hasSelectPermissions)
    return new Response(JSON.stringify({ error: 'Not authorized' }));

  // 2. Get document
  const { error: documentError, data: document } = await sdk.document.get(documentId);
  if (documentError || !document)
    return new Response(JSON.stringify({ error: documentError?.message }));

  // 3. Get TEI/XML content
  const { error: storageError, data: blob } = await sdk.storage.from(document.bucket_id!).download(documentId);
  if (storageError || !blob)
    return new Response(JSON.stringify({ error: storageError?.message }));

  const xml = await blob.text();

  // 4. Get layers
  const { error: layersError, data: layers } = await sdk.layers.getDocumentLayersInProject(documentId!, projectId!);
  if (layersError || !layers)
    return new Response(JSON.stringify({ message: layersError?.message }));

  const layerIds = layers.map((l) => l.id);

  // 5. Get annotations
  const { error: anntotationsError, data: annotations } = await sdk.annotations.get(layerIds);
  if (anntotationsError || !annotations)
    return new Response(JSON.stringify({ message: anntotationsError?.message }));

  // TODO: magic happens
  const filename = `${projectId}-${documentId}.json`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml',
      // 'Content-Type': 'application/tei+xml',
      // 'Content-Disposition': `attachment;filename=${filename}`
    },
    status: 200
  });
}