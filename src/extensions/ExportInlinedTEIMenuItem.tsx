import { Code } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DocumentCardActionsExtensionProps } from '@recogito/studio-sdk';

export const ExportInlinedTEIMenuItem = (props: DocumentCardActionsExtensionProps) => {

  return (
    // <Dropdown.Item className="dropdown-item"> */}
      <a href={`/api/${props.projectId}/${props.document?.id}/export/inline-tei`}>
        <Code size={16}/> Export Flattened TEI 
      </a>
    // </Dropdown.Item>
  )

}