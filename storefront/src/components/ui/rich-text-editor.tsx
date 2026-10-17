"use client"

import React, { useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { Node, mergeAttributes } from '@tiptap/core'
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import { Image as BaseImage } from "@tiptap/extension-image"
import { Youtube } from "@tiptap/extension-youtube"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"

import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Sparkles, ChevronDown, Maximize, Highlighter,
  Eraser, Outdent, Indent, Table as TableIcon, Smile, Omega, Minus,
  Code, Undo, Redo, Image as ImageIcon, Video, Type, X
} from "lucide-react"

// Custom Image Extension to support Width & Height resizing
const CustomImage = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        }
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        }
      }
    }
  }
})

// Custom Video Extension to support standard HTML5 video tags and resizing
const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: '100%' },
      height: { default: 'auto' },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { 
      controls: 'true', 
      style: `max-width: 100%; width: ${HTMLAttributes.width}; height: ${HTMLAttributes.height}; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;` 
    })]
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Type something" }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Media Modal state
  const mediaLinkRef = useRef<HTMLInputElement>(null)
  const [mediaDialog, setMediaDialog] = useState<{isOpen: boolean, type: 'image' | 'video'}>({ isOpen: false, type: 'image' })

  // Link Modal state
  const linkURLRef = useRef<HTMLInputElement>(null)
  const [linkDialog, setLinkDialog] = useState(false)

  // Table Modal state
  const [tableDialog, setTableDialog] = useState(false)
  const [hoveredCell, setHoveredCell] = useState({ r: 0, c: 0 })
  const [tableInputs, setTableInputs] = useState({ rows: 3, cols: 3 })

  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video' | 'youtube' } | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      CustomImage,
      Youtube,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      VideoExtension,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      if (editor.isActive('image')) setSelectedMedia({ type: 'image' })
      else if (editor.isActive('video')) setSelectedMedia({ type: 'video' })
      else if (editor.isActive('youtube')) setSelectedMedia({ type: 'youtube' })
      else setSelectedMedia(null)
    },
    editorProps: {
      attributes: {
        class: 'w-full p-4 min-h-[256px] outline-none resize-none text-sm text-foreground prose dark:prose-invert max-w-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  // Handle Text Link insertion
  const openLinkDialog = () => {
    setLinkDialog(true)
    setTimeout(() => {
      if (linkURLRef.current) {
        linkURLRef.current.value = editor.getAttributes('link').href || ''
        linkURLRef.current.focus()
      }
    }, 10)
  }

  const handleLinkSubmitDialog = () => {
    const url = linkURLRef.current?.value
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkDialog(false)
  }

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLinkSubmitDialog()
    }
  }

  // Handle Media insertion
  const handleMediaSubmit = () => {
    const url = mediaLinkRef.current?.value
    if (!url) return

    if (mediaDialog.type === 'image') {
      editor.chain().focus().setImage({ src: url }).run()
    } else {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run()
      } else {
        editor.chain().focus().insertContent(`<video controls src="${url}" style="max-width: 100%; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;"></video>`).run()
      }
    }
    setMediaDialog({ isOpen: false, type: 'image' })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      if (mediaDialog.type === 'image') {
        editor.chain().focus().setImage({ src }).run()
      } else {
        editor.chain().focus().insertContent(`<video controls src="${src}" style="max-width: 100%; border-radius: 8px; margin-top: 1rem; margin-bottom: 1rem;"></video>`).run()
      }
      setMediaDialog({ isOpen: false, type: 'image' })
    }
    reader.readAsDataURL(file)
  }

  const handleMediaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleMediaSubmit()
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const updateMediaSize = (dimension: 'width' | 'height', val: string) => {
    if (!selectedMedia) return
    editor.chain().focus().updateAttributes(selectedMedia.type, { [dimension]: val }).run()
  }

  return (
    <div ref={containerRef} className="border border-border rounded-md bg-card flex flex-col relative z-10 text-card-foreground">
      
      {/* Primary Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50 rounded-t-md">
        <ToolbarButton icon={<Maximize />} onClick={toggleFullscreen} />
        <div className="w-px h-5 bg-border mx-1"></div>
        
        <ToolbarButton icon={<Bold />} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} />
        <ToolbarButton icon={<Italic />} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} />
        <ToolbarButton icon={<UnderlineIcon />} onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} />
        <ToolbarButton icon={<Strikethrough />} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} />
        
        <div className="w-px h-5 bg-border mx-1"></div>
        
        {/* Font Size Mock */}
        <button className="flex items-center gap-1 p-1.5 text-sm font-medium text-foreground hover:bg-muted rounded">
          12 <ChevronDown className="w-3 h-3" />
        </button>
        
        {/* Text Color */}
        <label className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors cursor-pointer flex items-center relative" title="Text Color">
          <Type className="w-4 h-4 text-foreground" />
          <input 
            type="color" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} 
            value={editor.getAttributes('textStyle').color || '#000000'}
          />
        </label>
        
        {/* Highlight Color */}
        <label className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors cursor-pointer flex items-center relative" title="Highlight Color">
          <Highlighter className="w-4 h-4 text-foreground" />
          <input 
            type="color" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()} 
          />
        </label>

        <ToolbarButton icon={<Eraser />} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting" />
        
        <div className="w-px h-5 bg-border mx-1"></div>
        
        {/* Paragraph Format */}
        <select 
          className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer p-1 rounded hover:bg-muted"
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : 'p'
          }
        >
          <option value="p">¶ Normal</option>
          <option value="1">H1 Heading 1</option>
          <option value="2">H2 Heading 2</option>
          <option value="3">H3 Heading 3</option>
        </select>

        <div className="w-px h-5 bg-border mx-1"></div>

        <ToolbarButton icon={<AlignLeft />} onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} />
        <ToolbarButton icon={<AlignCenter />} onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} />
        <ToolbarButton icon={<AlignRight />} onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} />
        <ToolbarButton icon={<AlignJustify />} onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} />
        
        <div className="w-px h-5 bg-border mx-1"></div>

        <ToolbarButton icon={<List />} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} />
        <ToolbarButton icon={<ListOrdered />} onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} />
        <ToolbarButton icon={<Outdent />} onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')} />
        <ToolbarButton icon={<Indent />} onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')} />
        
        <div className="w-px h-5 bg-border mx-1"></div>

        {/* Text Link Dropdown Modal */}
        <div className="relative">
          <ToolbarButton icon={<LinkIcon />} onClick={openLinkDialog} isActive={editor.isActive('link') || linkDialog} />
          
          {linkDialog && (
            <div className="absolute z-50 top-full ltr:left-0 rtl:right-0 mt-1 p-3 bg-card rounded-md shadow-lg border border-border w-[280px]">
               <h4 className="text-sm font-semibold mb-3 text-foreground">Insert Link</h4>
               
               <div>
                 <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From Link</label>
                 <div className="flex gap-2">
                   <input ref={linkURLRef} onKeyDown={handleLinkKeyDown} type="text" placeholder="https://..." className="flex-1 text-sm bg-background border border-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all min-w-0" />
                   <button onClick={handleLinkSubmitDialog} type="button" className="shrink-0 bg-[#ff2d55] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#e6224c] transition-colors">Apply</button>
                 </div>
               </div>
               
               <button onClick={() => setLinkDialog(false)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                 <X className="w-4 h-4" />
               </button>
            </div>
          )}
        </div>

        {/* Table Dropdown Modal */}
        <div className="relative">
          <ToolbarButton icon={<TableIcon />} onClick={() => setTableDialog(!tableDialog)} isActive={tableDialog} />
          
          {tableDialog && (
            <div className="absolute z-50 top-full ltr:left-0 rtl:right-0 mt-1 p-3 bg-card rounded-md shadow-lg border border-border w-[260px]">
               <div className="flex justify-between items-center mb-3">
                 <h4 className="text-sm font-semibold text-foreground">Insert Table</h4>
                 <button onClick={() => setTableDialog(false)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Grid Selector */}
               <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs text-muted-foreground font-medium">Grid Selection</span>
                   <span className="text-xs font-bold text-[#ff2d55]">{hoveredCell.r > 0 ? `${hoveredCell.c} × ${hoveredCell.r}` : '0 × 0'}</span>
                 </div>
                 <div className="flex flex-col gap-0.5" onMouseLeave={() => setHoveredCell({ r: 0, c: 0 })}>
                   {Array.from({ length: 8 }).map((_, r) => (
                     <div key={r} className="flex gap-0.5 justify-between">
                       {Array.from({ length: 8 }).map((_, c) => {
                         const isHovered = r < hoveredCell.r && c < hoveredCell.c;
                         return (
                           <div 
                             key={c}
                             className={`w-6 h-6 border rounded-sm cursor-pointer transition-colors duration-75 ${isHovered ? 'bg-[#ff2d55]/20 border-[#ff2d55]/50' : 'bg-background border-border hover:border-gray-400'}`}
                             onMouseEnter={() => setHoveredCell({ r: r + 1, c: c + 1 })}
                             onClick={() => {
                                editor.chain().focus().insertTable({ rows: r + 1, cols: c + 1, withHeaderRow: true }).run();
                                setTableDialog(false);
                             }}
                           />
                         )
                       })}
                     </div>
                   ))}
                 </div>
               </div>

               {/* Custom Input */}
               <div className="border-t border-border pt-3">
                 <span className="text-xs text-muted-foreground font-medium mb-2 block">Custom Size</span>
                 <div className="flex items-center gap-2">
                   <input type="number" min="1" max="100" value={tableInputs.cols} onChange={e => setTableInputs(p => ({ ...p, cols: parseInt(e.target.value) || 1 }))} className="w-16 text-xs bg-background border border-border rounded px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" placeholder="Cols" title="Columns" />
                   <span className="text-xs text-muted-foreground">×</span>
                   <input type="number" min="1" max="100" value={tableInputs.rows} onChange={e => setTableInputs(p => ({ ...p, rows: parseInt(e.target.value) || 1 }))} className="w-16 text-xs bg-background border border-border rounded px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" placeholder="Rows" title="Rows" />
                   <button 
                     onClick={() => {
                       editor.chain().focus().insertTable({ rows: tableInputs.rows, cols: tableInputs.cols, withHeaderRow: true }).run();
                       setTableDialog(false);
                     }}
                     type="button"
                     className="ml-auto shrink-0 bg-[#ff2d55] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#e6224c] transition-colors"
                   >
                     Add
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>
        <ToolbarButton icon={<Smile />} onClick={() => editor.chain().focus().insertContent('😀').run()} />
        <ToolbarButton icon={<Omega />} onClick={() => editor.chain().focus().insertContent('Ω').run()} />
        <ToolbarButton icon={<Minus />} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <ToolbarButton icon={<Code />} onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} />
        <ToolbarButton icon={<Undo />} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <ToolbarButton icon={<Redo />} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
      </div>

      {/* Secondary Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50 relative min-h-[42px]">
        <ToolbarButton icon={<Undo className="scale-x-[-1]" />} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <ToolbarButton icon={<ImageIcon />} onClick={() => setMediaDialog({ isOpen: true, type: 'image' })} />
        <ToolbarButton icon={<Video />} onClick={() => setMediaDialog({ isOpen: true, type: 'video' })} />
        
        {/* Media Size Controls (Shows when image/video is selected) */}
        {selectedMedia && (
          <div className="ml-4 flex items-center bg-card border border-border shadow-sm rounded-md p-1 gap-2">
            <span className="text-xs font-semibold text-muted-foreground pl-1">Size:</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">W</span>
              <input 
                type="text" 
                placeholder="auto" 
                className="w-16 text-xs bg-background border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#ff2d55]"
                value={editor.getAttributes(selectedMedia.type).width || ''}
                onChange={(e) => updateMediaSize('width', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">H</span>
              <input 
                type="text" 
                placeholder="auto" 
                className="w-16 text-xs bg-background border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#ff2d55]"
                value={editor.getAttributes(selectedMedia.type).height || ''}
                onChange={(e) => updateMediaSize('height', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Media Dialog Overlay */}
        {mediaDialog.isOpen && (
          <div className="absolute z-50 top-full ltr:left-10 rtl:right-10 mt-1 p-3 bg-card rounded-md shadow-lg border border-border w-[280px]">
             <h4 className="text-sm font-semibold mb-3 text-foreground">Add {mediaDialog.type === 'image' ? 'Image' : 'Video'}</h4>
             
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From Link</label>
                 <div className="flex gap-2">
                   <input ref={mediaLinkRef} onKeyDown={handleMediaKeyDown} type="text" placeholder="https://..." className="flex-1 text-sm bg-background border border-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all min-w-0" />
                   <button onClick={handleMediaSubmit} type="button" className="shrink-0 bg-[#ff2d55] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#e6224c] transition-colors">Add</button>
                 </div>
               </div>
               
               <div className="relative border-t border-border pt-3">
                 <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Upload from Computer</label>
                 <input type="file" accept={mediaDialog.type === 'image' ? 'image/*' : 'video/*'} className="text-xs w-full text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer" onChange={handleFileUpload} />
               </div>
             </div>
             
             <button onClick={() => setMediaDialog({ isOpen: false, type: 'image' })} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
               <X className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
      
      {/* Editor Content Area */}
      <div className="bg-background min-h-[256px]">
        <EditorContent editor={editor} />
      </div>
      
      {/* Footer Area */}
      <div className="p-2 border-t border-border flex justify-end bg-muted/30 rounded-b-md">
        <button type="button" className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-100 dark:border-purple-800/30 flex items-center gap-2 text-sm font-medium" title="Generate description with AI">
          <Sparkles className="w-4 h-4" /> AI Generate
        </button>
      </div>
    </div>
  )
}

function ToolbarButton({ 
  onClick, 
  isActive = false, 
  disabled = false,
  icon,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean;
  icon: React.ReactNode;
  title?: string;
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      type="button"
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive 
          ? "bg-muted text-foreground font-bold shadow-inner" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-[18px] h-[18px]" })}
    </button>
  )
}
