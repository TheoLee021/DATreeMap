import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TreeMap from './components/TreeMap';
import About from './components/About';
import NotFound from './components/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TreeMap />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App; 