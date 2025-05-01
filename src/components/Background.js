
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const BackgroundAnimation = ({ gifUrl }) => {
  const router = useRouter();
  const [key, setKey] = useState(0); // Estado para forçar a re-renderização

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setKey(prevKey => prevKey + 1);
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <div
      key={key}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
      }}
    >
      <img
        src={'https://i.pinimg.com/originals/45/98/6d/45986d3cf4d64299869db2be4704719e.gif'}
        alt="Fundo Animado"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

export default BackgroundAnimation;