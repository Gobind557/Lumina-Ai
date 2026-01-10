import { ChangeEvent } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="flex-1 p-5 relative overflow-hidden">
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Hi James,&#10;&#10;I noticed that: [insert personalized text here].&#10;&#10;I'd love to connect and discuss how our solutions can help you achieve your goals."
        className="w-full h-full bg-transparent text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
      />
      {value && (
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {value.length} characters
        </div>
      )}
    </div>
  )
}
