import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

// Hook que controla o início/fim de uma gravação de voz.
// `aoFinalizar` recebe { id, uri, duracao } quando a gravação termina.
export default function useGravador(aoFinalizar) {
  const gravacaoRef = useRef(null);
  const [gravando, setGravando] = useState(false);
  const [tempo, setTempo] = useState(0); // ms gravados

  async function iniciar() {
    try {
      const permissao = await Audio.requestPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert('Permissão negada', 'Libere o microfone para gravar.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => setTempo(status.durationMillis ?? 0)
      );
      gravacaoRef.current = recording;
      setGravando(true);
    } catch (erro) {
      console.warn(erro);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }

  async function parar() {
    const gravacao = gravacaoRef.current;
    if (!gravacao) return;
    try {
      const { durationMillis } = await gravacao.getStatusAsync();
      await gravacao.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uriTemporaria = gravacao.getURI();

      // Copia para uma pasta permanente (a de cache pode ser limpa pelo sistema)
      const id = String(Date.now());
      const destino = `${FileSystem.documentDirectory}gravacao_${id}.m4a`;
      await FileSystem.copyAsync({ from: uriTemporaria, to: destino });

      aoFinalizar({ id, uri: destino, duracao: durationMillis ?? 0 });
    } catch (erro) {
      console.warn(erro);
      Alert.alert('Erro', 'Não foi possível salvar a gravação.');
    } finally {
      gravacaoRef.current = null;
      setGravando(false);
      setTempo(0);
    }
  }

  // Se o componente sair da tela no meio da gravação, encerra o microfone
  useEffect(() => {
    return () => {
      gravacaoRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  return { gravando, tempo, iniciar, parar };
}
