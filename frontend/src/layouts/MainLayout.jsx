import { Navbar } from '../components/Navbar';
import '../styles/MainLayout.scss';

export const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <p>&copy; 2026 PFG - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};
