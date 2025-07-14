import Welcome from '../components/Inicio';

// Renderiza o componente de boas-vindas na rota raiz.
const HomePage = () => {
  return (
    <div className="pagina-container">
      <Welcome />
    </div>
  );
};

export default HomePage;