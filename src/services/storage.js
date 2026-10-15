import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_GRAVACOES = '@meu_gravador:gravacoes';
const CHAVE_MUSICAS = '@meu_gravador:musicas';

// Lê uma lista. Devolve `padrao` se não existir ou se der erro.
async function ler(chave, padrao) {
  try {
    const json = await AsyncStorage.getItem(chave);
    return json ? JSON.parse(json) : padrao;
  } catch (erro) {
    console.warn('Erro ao carregar', chave, erro);
    return padrao;
  }
}

async function gravar(chave, lista) {
  try {
    await AsyncStorage.setItem(chave, JSON.stringify(lista));
  } catch (erro) {
    console.warn('Erro ao salvar', chave, erro);
  }
}

export const carregarGravacoes = () => ler(CHAVE_GRAVACOES, []);
export const salvarGravacoes = (lista) => gravar(CHAVE_GRAVACOES, lista);

// Músicas: null = primeira abertura do app (ainda nada salvo)
export const carregarMusicas = () => ler(CHAVE_MUSICAS, null);
export const salvarMusicas = (lista) => gravar(CHAVE_MUSICAS, lista);
