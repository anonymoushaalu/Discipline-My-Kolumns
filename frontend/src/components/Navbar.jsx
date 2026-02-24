import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🧱 Discipline-My-Kolumns
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>Dashboard</Link>
          <Link to="/create-job" style={styles.link}>📤 Create Job</Link>
          <Link to="/data" style={styles.link}>💾 Data</Link>
          <Link to="/rules" style={styles.link}>⚙️ Rules</Link>
          <Link to="/quarantine" style={styles.link}>⚠️ Quarantine</Link>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#24283b',
    color: 'white',
    padding: '0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '15px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  links: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.3s',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '4px',
    ':hover': {
      color: '#007bff'
    }
  }
};
