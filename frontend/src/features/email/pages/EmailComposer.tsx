import { useState } from 'react'
import { Send, Sparkles, Bold, Italic, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Flag, List, ListOrdered } from 'lucide-react'
import { CopilotPanel, RichTextEditor } from '../components'
import { useEmailDraft } from '../hooks'

export default function EmailComposer() {
  const { draft, updateSubject, updateContent } = useEmailDraft()

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Composer Area */}
      <div className="flex-1 flex flex-col p-5 space-y-4 overflow-hidden">
        {/* Card Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white/95 border border-gray-200 rounded-lg shadow-sm">
          {/* Subject Line */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Subject
            </label>
            <input
              type="text"
              value={draft.subject}
              onChange={(e) => updateSubject(e.target.value)}
              placeholder="What's this email about?"
              className="w-full px-4 py-2.5 bg-transparent border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all text-sm"
            />
          </div>

          {/* Email Body */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-shrink-0 px-4 pt-4 pb-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Message
              </label>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <RichTextEditor value={draft.content} onChange={updateContent} />
              
              {/* Toolbar */}
              <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 flex items-center gap-1 flex-wrap flex-shrink-0">
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bold">
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Italic">
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Insert Link">
                  <LinkIcon className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                  <AlignLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                  <AlignCenter className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                  <AlignRight className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Flag">
                  <Flag className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Bullet List">
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Numbered List">
                  <ListOrdered className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0 p-4 border-t border-gray-200">
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-lg">
              <Send className="w-4 h-4" />
              Send
              <span className="text-xs opacity-75">▼</span>
            </button>
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-blue-500 hover:from-purple-700 hover:via-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 text-sm shadow-lg">
              <Sparkles className="w-4 h-4" />
              Personalize with AI
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copilot Panel */}
      <CopilotPanel draft={draft} />
    </div>
  )
}
