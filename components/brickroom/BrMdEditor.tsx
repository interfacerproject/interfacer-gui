import MdParser from "lib/MdParser";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

// Components
import PFieldInfo, { PFieldInfoProps } from "components/polaris/PFieldInfo";
import PHelp from "components/polaris/PHelp";

//

export interface BrMdEditorProps extends PFieldInfoProps {
  onChange?: (data: { html: string; text: string }) => void;
  editorClass?: string;
  subtitle?: string;
  name?: string;
  id?: string;
}

//

export default function BrMdEditor(props: BrMdEditorProps) {
  const { editorClass, subtitle, name, onChange = () => {}, id } = props;

  return (
    <PFieldInfo htmlFor={id} {...props}>
      <PHelp helpText={subtitle} />

      <div className="pt-2">
        <MdEditor
          className={editorClass}
          renderHTML={text => MdParser.render(text)}
          onChange={onChange}
          name={name}
          id={id}
        />
      </div>
    </PFieldInfo>
  );
}
