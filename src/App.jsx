import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SyntaxTreeVisualizer from './Analyzer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SyntaxTreeVisualizer/>
    </>
  )
}

export default App
