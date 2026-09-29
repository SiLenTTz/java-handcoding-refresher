import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`prose prose-invert prose-zinc max-w-none prose-pre:p-0 prose-headings:scroll-mt-20 ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** Renders a Java snippet with syntax highlighting. */
export function JavaBlock({ code }: { code: string }) {
  return <Markdown>{'```java\n' + code.trim() + '\n```'}</Markdown>
}
