import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DicionarioVerde from './pages/DicionarioVerde';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dicionario" element={<DicionarioVerde />} />
      </Routes>
    </>
  );
}

export default App;
