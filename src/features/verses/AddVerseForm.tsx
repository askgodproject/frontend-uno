import { useState } from 'react'
import { useAddVerseMutation } from './versesApi'
import { useAppDispatch } from '@/app/hooks'
import { addNotification } from '@/features/notifications/notificationsSlice'

const AddVerseForm = () => {
  const [reference, setReference] = useState('')
  const [text, setText] = useState('')
  const dispatch = useAppDispatch()
  const [addVerse, { isLoading }] = useAddVerseMutation()

  const handleAdd = () => {
    if (!text.trim() || !reference.trim()) return

    let body = {
      reference,
      text,
      mark: undefined
    }
    addVerse(body)

    dispatch(addNotification({ id: crypto.randomUUID(), message: 'Verse added!', type: 'success' }))
    setReference('')
    setText('')
  }

  return (
    <div>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Reference (e.g. John 3:16)"
        style={{ width: '100%' }}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Verse text"
        rows={3}
        style={{ width: '100%' }}
      />
      <button onClick={handleAdd} disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Verse'}
      </button>
    </div>
  )
}

export default AddVerseForm
