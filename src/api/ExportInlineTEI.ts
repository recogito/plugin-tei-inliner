import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, params, cookies }) => {
  const projectId = params.projectId;
  const documentId = params.documentId;

  const filename = `${projectId}-${documentId}.json`;

  return new Response(JSON.stringify({ message: 'TODO' }), {
    headers: {
      'Content-Type': 'text/json',
      'Content-Disposition': `attachment;filename=${filename}`
    },
    status: 200
  });
}