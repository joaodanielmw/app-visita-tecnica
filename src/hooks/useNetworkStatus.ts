import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Retorna true/false de forma otimista: só vira "offline" quando o
 * NetInfo tem certeza de que não há conexão (isConnected === false) ou
 * de que a internet não é alcançável (isInternetReachable === false).
 * Estados "indeterminados" (null, comuns logo na abertura do app) não
 * disparam o banner de offline para evitar um falso alarme piscando na
 * tela.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOnline(!offline);
    });
    return () => unsubscribe();
  }, []);

  return isOnline;
}
