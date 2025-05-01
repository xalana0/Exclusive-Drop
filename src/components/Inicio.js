import '../styles/Inicio.css';
import '../styles/page.css';
import '../styles/LoginRegister.css';

import { useState } from 'react';
import Link from 'next/link';
import BackgroundAnimation from './Background';

function Welcome() {
  const [showOptions, setShowOptions] = useState(false);

  const handleEntrarClick = () => {
    setShowOptions(true);
  };

  return (
    
    <><BackgroundAnimation gifUrl="https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif" />
    <div className="container">
      <h2 className="nome">Exclusive Drop</h2>
      
      {!showOptions ? (
        <button
          onClick={handleEntrarClick}
          className="btn btn-primary"
        >
          Entrar
        </button>
      ) : (
        
        <div className="options-container">
          <Link href="/login" className="btn btn-secondary">
            LOGIN
          </Link>
          <Link href="/register" className="btn btn-secondary">
            REGISTO
          </Link>
        </div>
      )}
      </div>
    </>
    );
}
export default Welcome;