import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { Audio } from 'expo-av';

// Hook que toca UMA gravação por vez e expõe progresso e estado.
export default function usePlayer() {
  const somRef = useRef(null);
  const [tocandoId, setTocandoId] = useState(null);
  const [pausado, setPausado] = useState(false);
  const [posicao, setPosicao] = useState(0);
  const [duracao, setDuracao] = useState(0);

  // Para e descarrega o áudio atual
  async function parar() {
    const som = somRef.current;
    somRef.current = null;
    if (som) {
      try {
        await som.stopAsync();
        await som.unloadAsync();
      } catch (erro) {
        // som já descarregado: nada a fazer
      }
    }
    setTocandoId(null);
    setPausado(false);
    setPosicao(0);
    setDuracao(0);
  }

  // Toca, ou alterna pausa/continuar se for o mesmo item
  async function tocar(item) {
    if (tocandoId === item.id && somRef.current) {
      if (pausado) {
        await somRef.current.playAsync();
        setPausado(false);
      } else {
        await somRef.current.pauseAsync();
        setPausado(true);
      }
      return;
    }

    await parar();
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        item.fonte ?? { uri: item.uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPosicao(status.positionMillis);
          setDuracao(status.durationMillis ?? item.duracao);
          if (status.didJustFinish) parar();
        }
      );
      somRef.current = sound;
      setTocandoId(item.id);
    } catch (erro) {
      console.warn(erro);
      Alert.alert('Erro', 'Não foi possível reproduzir este áudio.');
    }
  }

  // useEffect: para o áudio ao sair do app (segundo plano) ou fechar a tela
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado !== 'active') parar();
    });
    return () => {
      assinatura.remove();
      parar();
    };
  }, []);

  return { tocandoId, pausado, posicao, duracao, tocar, parar };
}
