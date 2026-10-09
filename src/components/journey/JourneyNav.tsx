import { Link } from 'react-router-dom';

export default function JourneyNav() {
  return <header className="journey-nav">
    <a className="journey-skip" href="#/#intro">Skip to content</a>
    <Link to="/" className="journey-brand" aria-label="Jose Garcia — home">Jose Garcia<span>Solutions & systems</span></Link>
    <nav aria-label="Main navigation">
      {['Work', 'Experience', 'About', 'Contact'].map(label => <Link key={label} to={`/#${label.toLowerCase()}`}
        onClick={() => document.getElementById(label.toLowerCase())?.scrollIntoView({ block: 'start', behavior: 'instant' })}>{label}</Link>)}
      <a href={`${import.meta.env.BASE_URL}Jose-Garcia-Resume.pdf`} target="_blank" rel="noreferrer">Résumé <span aria-hidden="true">↗</span></a>
    </nav>
  </header>;
}
