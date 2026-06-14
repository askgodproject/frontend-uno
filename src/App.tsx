import './App.css'
import VerseList from '@/features/verses/VerseList'
import { useShuffleVersesMutation } from '@/features/verses/versesApi'

function App() {
  const [shuffleVerses, { isLoading }] = useShuffleVersesMutation()

  return (
    <>
      <button onClick={() => shuffleVerses()} disabled={isLoading}>
        {isLoading ? 'Shuffling...' : 'Shuffle Verses'}
      </button>
      <VerseList/>
    </>
  )
}

export default App
