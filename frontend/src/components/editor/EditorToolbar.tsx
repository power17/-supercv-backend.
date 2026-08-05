import {
  ArrowLeft,
  Check,
  Download,
  LoaderCircle,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

type EditorToolbarProps = {
  name: string
  saved: boolean
  saving: boolean
  error?: string
  onNameChange: (name: string) => void
  onSave: () => void
  onExport: () => void
}

export function EditorToolbar({
  name,
  saved,
  saving,
  error,
  onNameChange,
  onSave,
  onExport,
}: EditorToolbarProps) {
  return (
    <header className="relative z-10 grid h-[58px] shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-[#dde2ea] bg-white px-4 max-md:grid-cols-[1fr_auto] max-md:px-2">
      <div className="flex min-w-0 items-center gap-2">
        <Link className="grid size-9 shrink-0 place-items-center rounded-md text-[#697386] hover:bg-[#f2f4f7]" to="/resume" aria-label="返回简历列表">
          <ArrowLeft size={19} />
        </Link>
        <span className="hidden h-6 w-px bg-[#e4e7ec] sm:block" />
        <input
          className="min-w-0 max-w-[230px] flex-1 rounded-md border border-transparent px-2 py-1.5 text-sm font-semibold text-[#384359] outline-none hover:border-[#dfe3ea] focus:border-[#8da7ff]"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-label="简历名称"
        />
        <span className={`hidden items-center gap-1 whitespace-nowrap text-[11px] sm:flex ${saved ? 'text-[#34a374]' : 'text-[#9aa2af]'}`}>
          {saved ? <Check size={14} /> : null}
          {saved ? '已保存' : '有未保存修改'}
        </span>
      </div>

      <div className="flex items-center gap-1 max-md:hidden">
        <button className="grid size-8 place-items-center rounded-md border-0 bg-transparent text-[#a4aab4]" type="button" title="撤销" disabled><Undo2 size={17} /></button>
        <button className="grid size-8 place-items-center rounded-md border-0 bg-transparent text-[#a4aab4]" type="button" title="重做" disabled><Redo2 size={17} /></button>
      </div>

      <div className="flex items-center justify-end gap-2">
        {error ? <span className="hidden text-xs text-[#d13c49] xl:inline">{error}</span> : null}
        <button
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-[#dfe4ec] bg-white px-3 text-xs font-medium text-[#526078] hover:bg-[#f7f9fc] disabled:cursor-wait"
          type="button"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />}
          <span className="max-sm:hidden">保存</span>
        </button>
        <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[#3279ed] px-3 text-xs font-semibold text-white hover:bg-[#256be0]" type="button" onClick={onExport}>
          <Download size={15} /> <span className="max-sm:hidden">导出 PDF</span>
        </button>
      </div>
    </header>
  )
}
