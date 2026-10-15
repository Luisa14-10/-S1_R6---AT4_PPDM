import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';

import ItemGravacao from './src/components/ItemGravacao';
import useGravador from './src/hooks/useGravador';
import usePlayer from './src/hooks/usePlayer';
import {
  carregarGravacoes, salvarGravacoes, carregarMusicas, salvarMusicas,
} from './src/services/storage';
import { FONTES, MUSICAS_PADRAO } from './src/data/catalogoMusicas';
import { formatarTempo, nomePadrao } from './src/utils/formatar';

export default function App() {
  const [aba, setAba] = useState('musicas'); // 'musicas' | 'gravacoes'
  const [musicas, setMusicas] = useState([]);
  const [gravacoes, setGravacoes] = useState([]);
  const [carregado, setCarregado] = useState(false);
  const player = usePlayer();

  function adicionarGravacao({ id, uri, duracao }) {
    setGravacoes((atual) => [{ id, uri, duracao, nome: nomePadrao(atual.length + 1) }, ...atual]);
  }
  const gravador = useGravador(adicionarGravacao);

  // Ao abrir: lê dados persistidos (músicas começam com a lista padrão na 1ª vez)
  useEffect(() => {
    async function iniciar() {
      const musicasSalvas = await carregarMusicas();
      setMusicas(musicasSalvas ?? MUSICAS_PADRAO);
      setGravacoes(await carregarGravacoes());
      setCarregado(true);
    }
    iniciar();
  }, []);

  // Persiste sempre que as listas mudam
  useEffect(() => {
    if (carregado) salvarGravacoes(gravacoes);
  }, [gravacoes, carregado]);

  useEffect(() => {
    if (carregado) salvarMusicas(musicas);
  }, [musicas, carregado]);

  // Exclui da tela e do armazenamento (gravações também apagam o arquivo)
  function excluir(item) {
    const ehMusica = Boolean(item.chave);
    Alert.alert('Excluir', `Excluir "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (player.tocandoId === item.id) await player.parar();
          if (ehMusica) {
            setMusicas((atual) => atual.filter((m) => m.id !== item.id));
          } else {
            await FileSystem.deleteAsync(item.uri, { idempotent: true }).catch(() => {});
            setGravacoes((atual) => atual.filter((g) => g.id !== item.id));
          }
        },
      },
    ]);
  }

  function restaurarMusicas() {
    setMusicas(MUSICAS_PADRAO);
  }

  // Lista exibida conforme a aba (músicas ganham a fonte de áudio local)
  const dados =
    aba === 'musicas' ? musicas.map((m) => ({ ...m, fonte: FONTES[m.chave] })) : gravacoes;

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="light" />
      <View style={styles.topo}>
        <Text style={styles.titulo}>🎙 Meu Gravador</Text>
        <Text style={styles.subtitulo}>Minhas músicas e notas de voz</Text>
      </View>

      <View style={styles.abas}>
        {[['musicas', '🎵 Músicas'], ['gravacoes', '🎙 Gravações']].map(([chave, rotulo]) => (
          <TouchableOpacity
            key={chave}
            style={[styles.aba, aba === chave && styles.abaAtiva]}
            onPress={() => setAba(chave)}
          >
            <Text style={[styles.textoAba, aba === chave && styles.textoAbaAtiva]}>{rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={dados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          aba === 'musicas' ? (
            <TouchableOpacity onPress={restaurarMusicas}>
              <Text style={styles.vazio}>Nenhuma música.{'\n'}Toque aqui para restaurar a lista.</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.vazio}>Nenhuma gravação ainda.{'\n'}Toque em Gravar abaixo!</Text>
          )
        }
        renderItem={({ item }) => (
          <ItemGravacao
            item={item}
            ativo={player.tocandoId === item.id}
            pausado={player.pausado}
            posicao={player.posicao}
            duracao={player.duracao}
            aoTocar={player.tocar}
            aoExcluir={excluir}
          />
        )}
      />

      {aba === 'gravacoes' && (
        <View style={styles.rodape}>
          <TouchableOpacity
            style={[styles.botaoGravar, gravador.gravando && styles.botaoParar]}
            onPress={gravador.gravando ? gravador.parar : gravador.iniciar}
          >
            <Text style={styles.textoGravar}>
              {gravador.gravando ? `⏹ Parar  ${formatarTempo(gravador.tempo)}` : '⏺ Gravar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F5F3FF' },
  topo: { backgroundColor: '#1E1B4B', padding: 20, paddingTop: 40 },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtitulo: { color: '#C4B5FD', marginTop: 4 },
  abas: { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: '#E9E5FF', borderRadius: 12, padding: 4 },
  aba: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  abaAtiva: { backgroundColor: '#6D28D9' },
  textoAba: { color: '#4C1D95', fontWeight: '600' },
  textoAbaAtiva: { color: '#fff' },
  lista: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  vazio: { textAlign: 'center', color: '#6B7280', marginTop: 60, lineHeight: 22 },
  rodape: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#F5F3FF' },
  botaoGravar: { backgroundColor: '#6D28D9', padding: 16, borderRadius: 30, alignItems: 'center' },
  botaoParar: { backgroundColor: '#DC2626' },
  textoGravar: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
