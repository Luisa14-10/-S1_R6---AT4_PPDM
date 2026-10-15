// Arquivos de áudio locais (pasta assets/musicas).
// require() não pode ser salvo no AsyncStorage, então guardamos só a "chave".
export const FONTES = {
  melodia1: require('../../assets/musicas/melodia1.mp3'),
  melodia2: require('../../assets/musicas/melodia2.mp3'),
  melodia3: require('../../assets/musicas/melodia3.mp3'),
  melodia4: require('../../assets/musicas/melodia4.mp3'),
  melodia5: require('../../assets/musicas/melodia5.mp3'),
};

// Lista inicial (troque os nomes pelos das suas músicas favoritas)
export const MUSICAS_PADRAO = [
  { id: 'musica_1', nome: 'Melodia 01 - Manhã Calma', chave: 'melodia1', duracao: 24000 },
  { id: 'musica_2', nome: 'Melodia 02 - Noite Suave', chave: 'melodia2', duracao: 24000 },
  { id: 'musica_3', nome: 'Melodia 03 - Dia Feliz', chave: 'melodia3', duracao: 24000 },
  { id: 'musica_4', nome: 'Melodia 04 - Cantiga', chave: 'melodia4', duracao: 24000 },
  { id: 'musica_5', nome: 'Melodia 05 - Relax', chave: 'melodia5', duracao: 24000 },
];
