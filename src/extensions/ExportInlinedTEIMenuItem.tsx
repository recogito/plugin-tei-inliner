import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { CaretRight, PuzzlePiece } from '@phosphor-icons/react';
import { DocumentCardActionsExtensionProps } from '@recogito/studio-sdk';

export const ExportInlinedTEIMenuItem = (
  props: DocumentCardActionsExtensionProps
) => {

  const { context, document, projectId } = props;

  const enabled = document.content_type === 'text/xml';

  const isDefaultContext = Boolean(context.is_project_default); 

  const baseUrl = `/api/${projectId}/${document?.id}/export/inline-tei`;

  const onSelect = (includeStandOff: boolean) => () => {
    const args = 
      // project-level + standoff annotations
      includeStandOff && isDefaultContext ? '?standoff=true' :
      // context-level + standoff annotations
      includeStandOff ? `?context=${context.id}&standoff=true` :
      // project-level, no standoff annotations
      isDefaultContext ? '' :
      // context-level, no standoff annotations
      `?context=${context.id}`;

    window.location.href = `${baseUrl}${args}`;
  }

  return (
    <Dropdown.Sub>
      <Dropdown.SubTrigger 
        disabled={!enabled}
        className="dropdown-subtrigger">
        <PuzzlePiece size={16}/> 
        Export TEI: Convert Annotations to Inline 
        <div className='right-slot'>
          <CaretRight size={16} />
        </div>
      </Dropdown.SubTrigger>

      <Dropdown.Portal>
				<Dropdown.SubContent
					className="dropdown-subcontent"
					alignOffset={-5}>
          <Dropdown.Item 
            className="dropdown-item"
            onSelect={onSelect(false)}>
            Recogito annotations only
          </Dropdown.Item>

          <Dropdown.Item 
            className="dropdown-item"
            onSelect={onSelect(true)}>
            Include existing read-only annotations
          </Dropdown.Item>
        </Dropdown.SubContent>
      </Dropdown.Portal>
    </Dropdown.Sub>
  )

}