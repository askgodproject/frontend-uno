const QuestionPage = () => {
  return (
    <div>
      <h2>Ask a Question</h2>
      <textarea
        placeholder="e.g. What does the Bible say about fear?"
        rows={4}
        style={{ width: '100%' }}
      />
      <br />
      <button>Ask</button>
    </div>
  )
}

export default QuestionPage
