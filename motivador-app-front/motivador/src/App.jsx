import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Subscribe from './pages/Subscribe';
import Home from './pages/Home';
//<Route path="/subscribe" element={<Subscribe />} />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Subscribe />} />
        <Route path="/inicio" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App
