import { test, eq } from './runner.js';
import { parseListing, shouldPlayMusic, trackName, mergeTracks } from '../js/music.js';

// Trecho no formato da listagem de pastas do "python -m http.server"
const LISTING = `<ul>
<li><a href="LEIA-ME.txt">LEIA-ME.txt</a></li>
<li><a href="Trilha%20da%20Manh%C3%A3.mp3">Trilha da Manhã.mp3</a></li>
<li><a href="calma.OGG">calma.OGG</a></li>
<li><a href="antigas/">antigas/</a></li>
<li><a href="capa.jpg">capa.jpg</a></li>
<li><a href="beta.m4a">beta.m4a</a></li>
</ul>`;

test('música: lê só arquivos de áudio da listagem, em ordem alfabética', () => {
  eq(parseListing(LISTING), [
    { url: 'beta.m4a', name: 'beta' },
    { url: 'calma.OGG', name: 'calma' },
    { url: 'Trilha%20da%20Manh%C3%A3.mp3', name: 'Trilha da Manhã' },
  ]);
});

test('música: listagem vazia ou sem áudio não dá músicas', () => {
  eq(parseListing(''), []);
  eq(parseListing('<a href="LEIA-ME.txt">x</a>'), []);
});

test('música: só no foco toca apenas no foco rodando', () => {
  eq(shouldPlayMusic({ mode: 'focus', running: true }, 'focus'), true);
  eq(shouldPlayMusic({ mode: 'short', running: true }, 'focus'), false);
  eq(shouldPlayMusic({ mode: 'focus', running: false }, 'focus'), false);
});

test('música: foco e pausas toca sempre que o timer roda; desligada nunca toca', () => {
  eq(shouldPlayMusic({ mode: 'long', running: true }, 'always'), true);
  eq(shouldPlayMusic({ mode: 'long', running: false }, 'always'), false);
  eq(shouldPlayMusic({ mode: 'focus', running: true }, 'off'), false);
});

test('música: nome da faixa é o nome do arquivo sem a extensão', () => {
  eq(trackName('C418 - Sweden.mp3'), 'C418 - Sweden');
  eq(trackName('chuva.calma.OGG'), 'chuva.calma');
  eq(trackName('sem-extensao'), 'sem-extensao');
});

test('música: junta as faixas da pasta e as escolhidas, em ordem alfabética', () => {
  const pasta = [{ url: 'musica/b.mp3', name: 'b' }];
  const escolhidas = [{ url: 'blob:1', name: 'a' }, { url: 'blob:2', name: 'c' }];
  eq(mergeTracks(pasta, escolhidas).map((t) => t.name), ['a', 'b', 'c']);
  eq(mergeTracks([], []), []);
});
