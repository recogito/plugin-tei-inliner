import { AnnotationBody } from '@annotorious/core';
import { parseXML, isInlinable, StandoffAnnotation } from '@recogito/standoff-converter';
import { createServerSDK, SupabaseAnnotation } from '@recogito/studio-sdk';
import { TEIAnnotationTarget } from '@recogito/text-annotator-tei';
import type { APIRoute } from 'astro';

// Helper to test if this annotation should be interpreted as a TEI tag
const isTag = (annotation: SupabaseAnnotation, tagName: string) => {
  const { bodies } = annotation;
  return bodies.some(b => {
    const body = b as AnnotationBody;
    if (!(body.purpose === 'tagging') || !(typeof body.value === 'string')) return;

    try {
      const value = JSON.parse(body.value);
      return value.id === tagName || value.label === tagName;
    } catch {
      return body.value === tagName;
    }
  });
}

/** 
 * Tests if there are any co-located Recogito Studio annotations for the 
 * given standoff annotation.
 */
const hasColocated = (s: StandoffAnnotation, annotations: SupabaseAnnotation[]) => {
  
  const isColocated = (s: StandoffAnnotation, a: SupabaseAnnotation) => {
    const sStart = `${s.start.path}::${s.start.offset}`;
    const sEnd = `${s.end.path}::${s.end.offset}`;

    // Consider annotations co-located if any of the Supabase annotation's
    // selectors match the standoff annotation boundaries
    const { selector } = (a.target as TEIAnnotationTarget);
    return selector.some(s =>
      sStart === s.startSelector.value && sEnd === s.endSelector.value);
  }

  return annotations.some(a => isColocated(s, a));
}

const inlineAnnotation = (annotation: SupabaseAnnotation, parsed: ReturnType<typeof parseXML>) => {
  const insertTag = (tagName: string) => {
    const { selector } = (annotation.target as TEIAnnotationTarget);
  
    selector.forEach(selector => {
      const { startSelector, endSelector } = selector;

      try {
        const startOffset = parsed.getCharacterOffset(startSelector.value);
        const endOffset = parsed.getCharacterOffset(endSelector.value);
        parsed.addInline(startOffset, endOffset, tagName);
      } catch (error) {
        // console.error(error);
      }
    });
  }

  // We'll check for (and insert) these tags
  const tags = ['placeName', 'persName'];

  tags.forEach(t => {
    if (isTag(annotation, t)) insertTag(t)
  });
}

export const GET: APIRoute = async ({ request, params, cookies, url }) => {
  const projectId = params.projectId;
  const documentId = params.documentId;

  const contextId = url.searchParams.get('context');
  const includeStandOff = url.searchParams.get('standoff') === 'true';
  
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
  const { error: documentError, data: document } = await sdk.documents.get(documentId);
  if (documentError || !document)
    return new Response(JSON.stringify({ error: documentError?.message }));

  // 3. Get TEI/XML content
  const { error: storageError, data: blob } = await sdk.storage.from(document.bucket_id!).download(documentId);
  if (storageError || !blob)
    return new Response(JSON.stringify({ error: storageError?.message }));

  const xml = await blob.text();
  const parsed = parseXML(xml);

  // 4. Get layers
  const getLayers = () => {
    if (contextId)
      return sdk.layers.getDocumentLayersInContext(documentId, contextId);
    else
      return sdk.layers.getDocumentLayersInProject(documentId!, projectId!);
  }

  const { error: layersError, data: layers } = await getLayers();
  if (layersError || !layers)
    return new Response(JSON.stringify({ message: layersError?.message }));

  const layerIds = layers.map((l) => l.id);

  // 5. Get Recogito annotations
  const { error: anntotationsError, data: annotations } = await sdk.annotations.get(layerIds);
  if (anntotationsError || !annotations)
    return new Response(JSON.stringify({ message: anntotationsError?.message }));

  if (includeStandOff) {
    // 6. Get inlinable embedded standoff annotations
    const standOffAnnotations = parsed.annotations()
      .filter(s => isInlinable(s))
      // Recogito Annotations override co-located standOffAnnotations!
      .filter(s => !hasColocated(s, annotations));

    standOffAnnotations.forEach(a => parsed.convertToInline(a));
  }
  
  annotations.forEach(a => inlineAnnotation(a, parsed));

  const filename = `${projectId}-${documentId}.xml`;

  return new Response(parsed.xmlString(), {
    headers: {
      'Content-Type': 'application/tei+xml',
      'Content-Disposition': `attachment;filename=${filename}`
    },
    status: 200
  });
}