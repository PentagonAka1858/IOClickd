import { Navbar } from '../components/Navbar';
import '../styles/MainLayout.scss';

export const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; 2026 I/OClickd! - Adrián Nieto Zampaña - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};