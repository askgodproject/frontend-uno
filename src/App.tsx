import './App.css'
import VerseList from '@/features/verses/VerseList'
import AddVerseForm from '@/features/verses/AddVerseForm'
import { useShuffleVersesMutation } from '@/features/verses/versesApi'

const App = () => {
  const [shuffleVerses, { isLoading }] = useShuffleVersesMutation()

  return (
    <>
      <button onClick={() => shuffleVerses()} disabled={isLoading}>
        {isLoading ? 'Shuffling...' : 'Shuffle Verses'}
      </button>
      <AddVerseForm/>
      <VerseList/>
    </>
  )
}

export default App
