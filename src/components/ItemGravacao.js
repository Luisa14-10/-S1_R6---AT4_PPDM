import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatarTempo } from '../utils/formatar';

// Uma linha da lista: nome, play/pause, excluir e (se estiver tocando) barra + timer.
export default function ItemGravacao({ item, ativo, pausado, posicao, duracao, aoTocar, aoExcluir }) {
  const total = ativo ? duracao : item.duracao;
  const progresso = ativo && total > 0 ? Math.min(posicao / total, 1) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.linha}>
        <TouchableOpacity style={styles.botaoPlay} onPress={() => aoTocar(item)}>
          <Text style={styles.icone}>{ativo && !pausado ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={1}>{item.nome}</Text>
          <Text style={styles.duracao}>Duração: {formatarTempo(item.duracao)}</Text>
        </View>

        <TouchableOpacity onPress={() => aoExcluir(item)} hitSlop={10}>
          <Text style={styles.excluir}>🗑</Text>
        </TouchableOpacity>
      </View>

      {ativo && (
        <View style={styles.linhaProgresso}>
          <View style={styles.barraFundo}>
            <View style={[styles.barraCheia, { width: `${progresso * 100}%` }]} />
          </View>
          <Text style={styles.timer}>
            {formatarTempo(posicao)} / {formatarTempo(total)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
  linha: { flexDirection: 'row', alignItems: 'center' },
  botaoPlay: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#6D28D9',
    alignItems: 'center', justifyContent: 'center',
  },
  icone: { color: '#fff', fontSize: 18 },
  info: { flex: 1, marginHorizontal: 12 },
  nome: { fontSize: 16, fontWeight: '600', color: '#1E1B4B' },
  duracao: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  excluir: { fontSize: 22 },
  linhaProgresso: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  barraFundo: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  barraCheia: { height: 6, backgroundColor: '#6D28D9' },
  timer: { marginLeft: 10, fontSize: 12, color: '#374151', minWidth: 72, textAlign: 'right' },
});
