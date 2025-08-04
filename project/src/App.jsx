import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import MonkeyApp from './components/MonkeyApp'

function App() {

  return (
    <Monetization>
      <MonkeyApp />
    </Monetization>
  )
}

export default App