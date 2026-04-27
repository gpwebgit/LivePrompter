import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './routes/Home/Home'
import Scaletta from './routes/Scaletta/Scaletta'
import Live from './routes/Live/Live'
import Impostazioni from './routes/Impostazioni/Impostazioni'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scaletta/new" element={<Scaletta />} />
        <Route path="/scaletta/:id" element={<Scaletta />} />
        <Route path="/live/:setlistId" element={<Live />} />
        <Route path="/impostazioni" element={<Impostazioni />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
