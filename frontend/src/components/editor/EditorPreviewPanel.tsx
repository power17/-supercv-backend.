import { Minus, Plus } from 'lucide-react'
import { ResumePreview } from '../ResumePreview'
import type { Resume } from '../../types'

type EditorPreviewPanelProps = {
  resume: Resume
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function EditorPreviewPanel({ resume, zoom, onZoomChange }: EditorPreviewPanelProps) {
  return (
    <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#e9ecf1]">
      <div className="relative z-[2] flex h-11 shrink-0 items-center justify-center border-b border-[#dadee4] bg-[#f6f7f9] text-xs text-[#7e8796]">
        <span>A4 · 实时预览</span>
        <div className="absolute right-4 flex h-7 items-center overflow-hidden rounded-md border border-[#dce0e7] bg-white">
          <button className="grid h-full w-7 cursor-pointer place-items-center border-0 bg-transparent hover:bg-[#f4f6f8]" type="button" onClick={() => onZoomChange(Math.max(40, zoom - 5))}><Minus size={14} /></button>
          <span className="min-w-11 text-center text-[11px]">{zoom}%</span>
          <button className="grid h-full w-7 cursor-pointer place-items-center border-0 bg-transparent hover:bg-[#f4f6f8]" type="button" onClick={() => onZoomChange(Math.min(110, zoom + 5))}><Plus size={14} /></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-8 pt-8 pb-24 max-md:px-3">
        <div className="mx-auto w-[794px] origin-top shadow-[0_5px_24px_rgba(39,51,78,0.12)]" style={{ transform: `scale(${zoom / 100})` }}>
          <ResumePreview resume={resume} />
        </div>
      </div>
    </main>
  )
}
