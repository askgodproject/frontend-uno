import { useEffect, use } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearVerses, setVerses, selectToggle, numSelected, selectedList } from './versesSlice'
import { useGetVersesQuery } from './versesApi'

const VerseList = () => {

  const dispatch = useAppDispatch()
  const selectedCount = useAppSelector(numSelected)
  const selected = useAppSelector(selectedList)
  const { data, isLoading, error } = useGetVersesQuery()

  useEffect(() => {
    dispatch(setVerses(data))
  }, [data])

  return (
    <div>
      {(selectedCount > 0) && 
        <>
          {selectedCount} verse{selectedCount == 1 ? '' : 's'} selected <br />
          <button onClick={() => dispatch(clearVerses())}>Clear</button>
        </>
      }
      {
        data && data.map((verse, index) => (
          <div
            key={verse.id}
            onClick={() => dispatch(selectToggle(index))}
            style={{ cursor: 'pointer', 
              borderColor: selected[index] ? 'black' : undefined,
              border: selected[index] ? 'solid 3px' : undefined,
              // fontWeight: selected[index] ? 'bold' : 'normal' 
              }}
          >
            <p>{verse.reference}</p>
            <b>{verse.text}</b>
            <br />
            <br />
          </div>
        ))
      }
    </div>
  )
}

export default VerseList