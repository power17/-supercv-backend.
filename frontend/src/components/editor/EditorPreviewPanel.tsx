import { Minus, Plus } from 'lucide-react'
import { ResumePreview } from '../ResumePreview'
import type { Resume } from '../../types'

type EditorPreviewPanelProps = {
  resume: Resume
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function EditorPreviewPanel({ resume, zoom, onZoomChange }: EditorPreviewPanelProps) {
  const scale = zoom / 100
  return (
    <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#e9ecf1] print:block print:h-auto print:overflow-visible print:bg-white">
      <div className="relative z-[2] flex h-11 shrink-0 items-center justify-center border-b border-[#dadee4] bg-[#f6f7f9] text-xs text-[#7e8796] print:hidden">
        <span>A4 · 实时预览</span>
        <div className="absolute right-4 flex h-7 items-center overflow-hidden rounded-md border border-[#dce0e7] bg-white">
          <button className="grid h-full w-7 cursor-pointer place-items-center border-0 bg-transparent hover:bg-[#f4f6f8]" type="button" onClick={() => onZoomChange(Math.max(40, zoom - 5))}><Minus size={14} /></button>
          <span className="min-w-11 text-center text-[11px]">{zoom}%</span>
          <button className="grid h-full w-7 cursor-pointer place-items-center border-0 bg-transparent hover:bg-[#f4f6f8]" type="button" onClick={() => onZoomChange(Math.min(110, zoom + 5))}><Plus size={14} /></button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-8 pt-8 pb-24 max-md:px-3 print:overflow-visible print:p-0">
        <div className="relative mx-auto print:!h-auto print:!w-[794px]" style={{ width: 794 * scale, height: 1123 * scale }}>
          <div className="absolute top-0 left-0 w-[794px] origin-top-left shadow-[0_5px_24px_rgba(39,51,78,0.12)] print:static print:!transform-none print:shadow-none" style={{ transform: `scale(${scale})` }}>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </main>
  )
}
