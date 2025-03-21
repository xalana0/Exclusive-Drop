import '../styles/Inicio.css';
import { NebulaScene } from "@/components/nebula-scene"
import '../styles/LoginRegister.css'; // Use the same Login.css file
function Welcome() {
 
    return (
 
      <div className="welcome-container">
       <h2 className='nome'>Exclusive Drop</h2>
        
        <a 
          href="/register"
          className="btn btn-primary"
        >
          Entrar
        </a>
      </div>
    );
  }
  
  export default Welcome;