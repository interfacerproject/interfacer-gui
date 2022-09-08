import dynamic from 'next/dynamic';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
// @ts-ignore
import emoji from 'markdown-it-emoji'
// @ts-ignore
import subscript from 'markdown-it-sub'
// @ts-ignore
import superscript from 'markdown-it-sup'
// @ts-ignore
import footnote from 'markdown-it-footnote'
// @ts-ignore
import deflist from 'markdown-it-deflist'
// @ts-ignore
import abbreviation from 'markdown-it-abbr'
// @ts-ignore
import insert from 'markdown-it-ins'
// @ts-ignore
import mark from 'markdown-it-mark'
// @ts-ignore
import tasklists from 'markdown-it-task-lists'
import {ExclamationIcon} from "@heroicons/react/solid";
import React from "react";

type BrMdEditorProps = {
    className?: string,
    onChange?: ({html,text}:{ html:string, text:string })=>void,
    error?:string,
    hint?:string,
    label?:string,
    editorClass?:string,
}

const mdParser = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    })
    .use(emoji)
    .use(subscript)
    .use(superscript)
    .use(footnote)
    .use(deflist)
    .use(abbreviation)
    .use(insert)
    .use(mark)
    .use(tasklists)



const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false,
});

const  BrMdEditor = ({className, onChange, error, hint, label, editorClass}:BrMdEditorProps)=> {
    return <div className={className}>
        <label className="label">
            <span className="label-text">{label}</span>
        </label>
        <MdEditor className={editorClass} renderHTML={text => mdParser.render(text)} onChange={onChange} />
        <label className="label">
                {error &&
                <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                    <ExclamationIcon className='w-5 h-5'/>
                    {error}</span>}
                {hint && <span className="label-text-alt">{hint}</span>}
            </label>
    </div>;
}

export default BrMdEditor
