import { PuzzlePiece } from '@phosphor-icons/react';
import { DocumentCardActionsExtensionProps } from '@recogito/studio-sdk';

export const ExportInlinedTEIMenuItem = (props: DocumentCardActionsExtensionProps) => {

  const { context, document, projectId } = props;

  const url = props.context.is_project_default 
    ? `/api/${projectId}/${document?.id}/export/inline-tei`
    : `/api/${projectId}/${document?.id}/export/inline-tei?context=${context.id}`;

  return (
    <a href={url}>
      <PuzzlePiece size={16}/> Export TEI: Convert Annotations to Inline Format 
    </a>
  )

}