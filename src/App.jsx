import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import GrammarAnalyzer from './Analyzer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <GrammarAnalyzer/>
    </>
  )
}

export default App
