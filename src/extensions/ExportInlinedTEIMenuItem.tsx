import { Code } from '@phosphor-icons/react';
import { DocumentCardActionsExtensionProps } from '@recogito/studio-sdk';

export const ExportInlinedTEIMenuItem = (props: DocumentCardActionsExtensionProps) => {

  return (
    <a href={`/api/${props.projectId}/${props.document?.id}/export/inline-tei`}>
      <Code size={16}/> Export Flattened TEI 
    </a>
  )

}