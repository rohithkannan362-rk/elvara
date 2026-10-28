import { createRoot } from 'react-dom/client';
import 'lenis/dist/lenis.css';
import './styles.css';
import './nav.css';
import './pages.css';
import './extras.css';
import './fx.css';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
