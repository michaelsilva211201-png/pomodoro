"""Liga o app Pomodoro: servidor local (só neste computador, sem cache antigo) e abre o navegador.

Uso: dois cliques em "Abrir Pomodoro" na Área de Trabalho, ou `python servir.py` nesta pasta.
Para desligar, feche a janela "Pomodoro".
"""
import functools
import http.server
import os
import socket
import webbrowser

PORTA = int(os.environ.get("POMODORO_PORTA", "5173"))
URL = f"http://localhost:{PORTA}"
PASTA = os.path.dirname(os.path.abspath(__file__))
ABRIR_NAVEGADOR = os.environ.get("POMODORO_SEM_NAVEGADOR") is None


class SemCacheAntigo(http.server.SimpleHTTPRequestHandler):
    """Pede ao navegador para sempre conferir se o arquivo mudou (evita ver versões antigas do app)."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, *args):
        pass  # janela silenciosa


def porta_ocupada():
    with socket.socket() as s:
        return s.connect_ex(("127.0.0.1", PORTA)) == 0


def main():
    if porta_ocupada():  # o app já está ligado: só abre o navegador
        if ABRIR_NAVEGADOR:
            webbrowser.open(URL)
        return
    handler = functools.partial(SemCacheAntigo, directory=PASTA)
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORTA), handler) as servidor:
        print(f"Pomodoro rodando em {URL}. Feche esta janela para desligar.")
        if ABRIR_NAVEGADOR:
            webbrowser.open(URL)
        servidor.serve_forever()


if __name__ == "__main__":
    main()
