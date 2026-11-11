import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import HousingLoan from './HousingLoan';
import EpfEstimator from './EpfEstimator';
import HirePurchase from './HirePurchase.jsx';
import RetirementSavings from './RetirementSavings';
import BuyRent from './BuyRent.jsx';
import brandIcon from '../icons/duit-compass.png';
import housingIcon from '../icons/housing-loan.png';
import epfIcon from '../icons/EPF fund estimator.png';
import retirementIcon from '../icons/retirement-fund-planning.png';
import heroImage from '../icons/duit-compass-main.png';
import hirePurchaseIcon from '../icons/hire-purchase-loan.png';
import buyRentIcon from '../icons/buy-rent.png';

const modules = [
  { id: 'epf', number: '01', icon: '◉', image: epfIcon, title: 'EPF Fund Estimator', category: 'FUTURE PLANNING', description: 'Estimate how your EPF savings could grow until retirement.', detail: '' },
  { id: 'housing', number: '02', icon: '⌂', image: housingIcon, title: 'Housing loan', category: 'HOME OWNERSHIP', description: 'Explore what your future home could mean for your monthly budget.', detail: 'Plan for home ownership with a clearer picture of borrowing and repayments.' },
  { id: 'retirement', number: '03', icon: '☼', image: retirementIcon, title: 'Retirement Fund Planning', category: 'FUTURE PLANNING', description: 'Think ahead and start planning for the retirement you envision.', detail: 'Consider your long-term savings and the future you want to build.' },
  { id: 'buy-rent', number: '04', icon: '⌂', image: buyRentIcon, title: 'Buy-Rent Analysis', category: 'PROPERTY INVESTMENT', description: 'Explore rental income, expenses and cash flow for an investment property.', detail: '' },
  { id: 'hire-purchase', number: '05', icon: '↗', image: hirePurchaseIcon, title: 'Hire purchase', category: 'VEHICLE FINANCING', description: 'Get a clearer view of financing a vehicle and the costs along the way.', detail: 'Explore vehicle financing and how repayments could fit into your plans.' },
];

function App() {
  const [page, setPage] = useState('home');
  const selected = modules.find((item) => item.id === page);

  function navigate(next) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return <>
    <header className="header">
      <div className="header-inner">
        <button className="brand" onClick={() => navigate('home')} aria-label="Duit Compass home">
          <img className="brand-icon" src={brandIcon} alt="" /><span><strong>Duit Compass</strong><small>FINANCIAL PLANNING</small></span>
        </button>
        <nav aria-label="Main navigation">
          <button className={page === 'home' ? 'active' : ''} onClick={() => navigate('home')}>Overview</button>
          <button className={selected ? 'active' : ''} onClick={() => { navigate('home'); setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }), 0); }}>Planning tools</button>
          <button className={page === 'about' ? 'active' : ''} onClick={() => navigate('about')}>About</button>
        </nav>
        <span className="location"><span>●</span> MADE FOR MALAYSIA</span>
      </div>
    </header>

    <main>
      {page === 'home' ? <>
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> A LITTLE CLARITY GOES A LONG WAY</div>
            <h1>Plan with clarity.<br /><em>Live with confidence.</em></h1>
            <p>Big financial decisions feel a little easier when you can see the bigger picture. Start planning, one step at a time.</p>
            <button className="primary" onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}>Explore planning tools <span>↗</span></button>
            <div className="hero-note"><span>✳</span> YOUR FINANCES, AT YOUR OWN PACE</div>
          </div>
          <img className="hero-image" src={heroImage} alt="Duit Compass: Plan wisely. Retire with confidence." />
        </section>

        <section className="intro wrap" id="tools">
          <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR PLANNING TOOLKIT</div><h2>Start where you are.</h2></div>
          <p>There’s no one-size-fits-all plan. Explore the areas that matter to you, at your own pace.</p>
        </section>
        <section className="cards wrap" aria-label="Planning tools">
          {modules.map((item) => <button className="card" key={item.id} onClick={() => navigate(item.id)}>
            <div className="card-top">{item.image ? <img className="module-icon" src={item.image} alt="" /> : <span className="card-icon">{item.icon}</span>}<span className="card-number">{item.number} / {String(modules.length).padStart(2, '0')}</span></div>
            <span className="category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p>
            <span className="card-link">Explore this tool <span>↗</span></span>
          </button>)}
        </section>
        <section className="reassurance wrap"><div className="reassurance-icon">✳</div><div><h3>Good planning starts with a little curiosity.</h3><p>Explore loans, EPF and retirement planning at your own pace.</p></div><span>MADE FOR REAL LIFE <span>↗</span></span></section>
      </> : page === 'housing' ? <HousingLoan onBack={() => navigate('home')} /> : page === 'hire-purchase' ? <HirePurchase onBack={() => navigate('home')} /> : page === 'retirement' ? <RetirementSavings onBack={() => navigate('home')} /> : page === 'epf' ? <EpfEstimator onBack={() => navigate('home')} /> : page === 'buy-rent' ? <BuyRent onBack={() => navigate('home')} /> : selected ? <section className="subpage wrap">
        <button className="back" onClick={() => navigate('home')}>← Back to overview</button>
        <div className="eyebrow"><span className="eyebrow-line" /> {selected.category}</div>
        <h1>{selected.title}<em>.</em></h1><p className="lead">{selected.detail}</p>
        <div className="placeholder"><span className="card-icon">{selected.icon}</span><div><span className="category">COMING SOON</span><h2>Something thoughtful is in the works.</h2><p>This planning tool is not available yet. We’ll add its features and calculations in a future update.</p></div></div>
      </section> : <section className="subpage wrap">
        <button className="back" onClick={() => navigate('home')}>← Back to overview</button>
        <div className="eyebrow"><span className="eyebrow-line" /> ABOUT THIS PLATFORM</div>
        <h1>Planning, made <em>personal.</em></h1><p className="lead">Duit Compass is a work in progress, created to help individuals in Malaysia explore their finances with confidence.</p>
        <div className="about-grid"><div><h2>Built around you.</h2><p>No account is needed to explore the platform. Calculations run on your device; this version does not save financial information.</p></div><div><h2>A note on advice.</h2><p>This platform is for educational and general planning purposes only. It does not provide financial, investment, tax or legal advice. Consider seeking advice from a qualified professional before making financial decisions.</p></div></div>
      </section>}
    </main>
    <footer><div className="footer-inner wrap"><div><strong className="footer-brand"><img src={brandIcon} alt="" /> Duit Compass</strong><p>Small steps. A more considered future.</p></div><div className="footer-right"><button onClick={() => navigate('about')}>About & disclaimer ↗</button><p>For educational purposes only · Made for Malaysia</p></div></div></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
