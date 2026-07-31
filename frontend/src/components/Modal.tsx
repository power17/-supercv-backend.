import { X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

type ModalProps = PropsWithChildren<{
  title: string
  description?: ReactNode
  onClose: () => void
}>

export function Modal({ title, description, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="关闭">
          <X size={20} />
        </button>
        <h2 id="modal-title">{title}</h2>
        {description && <p className="modal-description">{description}</p>}
        {children}
      </section>
    </div>
  )
}

