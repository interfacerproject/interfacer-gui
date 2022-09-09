import MarkdownIt from "markdown-it";
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

const MdParser = new MarkdownIt({
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
export default MdParser
