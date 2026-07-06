import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        strike: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) {
    return null
  }

  function toggleLink() {
    const previousUrl = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link', previousUrl ?? 'https://')

    if (url === null) {
      return
    }

    if (url === '') {
      editor!.chain().focus().unsetLink().run()
      return
    }

    editor!.chain().focus().setLink({ href: url }).run()
  }

  const toolbarItems = [
    {
      label: 'Negrito',
      icon: Bold,
      isActive: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'Itálico',
      icon: Italic,
      isActive: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'Lista',
      icon: List,
      isActive: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: 'Lista numerada',
      icon: ListOrdered,
      isActive: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: 'Citação',
      icon: Quote,
      isActive: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: 'Link',
      icon: LinkIcon,
      isActive: editor.isActive('link'),
      onClick: toggleLink,
    },
  ]

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 border-b p-1">
        {toolbarItems.map(({ label, icon: Icon, isActive, onClick }) => (
          <Button
            key={label}
            type="button"
            title={label}
            variant={isActive ? 'default' : 'ghost'}
            size="icon"
            onClick={onClick}
          >
            <Icon className="size-4" />
          </Button>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          'rich-text-editor min-h-40 max-w-none p-3 text-sm focus-within:outline-none',
        )}
      />
    </div>
  )
}
