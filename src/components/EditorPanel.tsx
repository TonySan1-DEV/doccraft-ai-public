import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import { getCollabProvider } from '../lib/collaboration/yjsProvider'
import { generateUserAvatar } from '../lib/collaboration/presenceColors'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  Save,
  Users
} from 'lucide-react'

interface EditorPanelProps {
  content?: string
  onContentChange?: (content: string) => void
  onEditorReady?: (editor: any) => void
  placeholder?: string
  className?: string
  // Collaboration props
  docId?: string
  userId?: string
  userName?: string
  enableCollaboration?: boolean
}

export function EditorPanel({ 
  content = '', 
  onContentChange, 
  onEditorReady,
  placeholder = 'Start writing your document here...',
  className = '',
  docId = 'default-doc',
  userId = 'user-1',
  userName = 'Anonymous',
  enableCollaboration = false
}: EditorPanelProps) {
  // Get collaboration provider if collaboration is enabled
  const collabProvider = enableCollaboration ? getCollabProvider(docId) : null
  const userAvatar = generateUserAvatar(userId, userName)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      // Add collaboration extensions if enabled
      ...(enableCollaboration && collabProvider ? [
        Collaboration.configure({
          document: collabProvider.ydoc,
        }),
        CollaborationCursor.configure({
          provider: collabProvider.provider,
          user: {
            id: userId,
            name: userName,
            color: userAvatar.color,
          },
        }),
      ] : []),
    ],
    content: enableCollaboration ? undefined : content, // Don't set content for collaborative docs
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      onEditorReady?.(editor)
    },
  })

  if (!editor) {
    return null
  }

  const MenuBar = () => {
    return (
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('bold')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Bold className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('italic')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Italic className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('underline')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('bulletList')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-lg transition-colors ${
                editor.isActive('orderedList')
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Collaboration indicator */}
            {enableCollaboration && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-300">Live</span>
              </div>
            )}
            
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="h-4 w-4" />
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400">
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <MenuBar />
      <div className="flex-1 p-6 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="min-h-[400px] prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none text-gray-900 dark:text-white"
        />
        {!content && !enableCollaboration && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
} 