import MdParser from "lib/MdParser";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

// Components
import BrFieldInfo, { BrFieldInfoProps } from "components/brickroom/BrFieldInfo";

//

export interface BrMdEditorProps extends BrFieldInfoProps {
  onChange?: (data: { html: string; text: string }) => void;
  editorClass?: string;
  subtitle?: string;
  name?: string;
}

//

export default function BrMdEditor(props: BrMdEditorProps) {
  const { editorClass, testID, subtitle, name, onChange = () => {} } = props;

  return (
    <BrFieldInfo {...props}>
      <label className="label-text-alt">{subtitle}</label>

      <div data-test={testID} className="pt-2">
        <MdEditor className={editorClass} renderHTML={text => MdParser.render(text)} onChange={onChange} name={name} />
      </div>
    </BrFieldInfo>
  );
}
