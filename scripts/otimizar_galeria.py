#!/usr/bin/env python3
"""
Otimiza imagens da pasta galeria:
- Converte para WebP
- Largura máxima 600px
- Tamanho máximo 200KB (ajustando qualidade)
- Nomes SEO-friendly
Atualiza index.html e style.css e remove arquivos antigos.
"""
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Instale Pillow: pip install Pillow")
    sys.exit(1)

# Raiz do projeto (pasta onde está index.html)
ROOT = Path(__file__).resolve().parent.parent
GALERIA = ROOT / "galeria"
MAX_WIDTH = 600
MAX_BYTES = 200 * 1024  # 200KB
MIN_QUALITY = 50

# Mapeamento explícito: arquivo antigo -> nome novo SEO (imagens referenciadas no HTML/CSS)
MAPEAMENTO_SEO = {
    "293478001_1225890111558306_2940808128424761868_n.webp": "art-show-caixas-palco-campinas.webp",
    "442444135_1478879569375192_8864412821347479224_n.webp": "art-show-trio-eletrico-campinas.webp",
    "502420620_18159794353362702_8192347240069434232_n.webp": "art-show-caixas-convencionais-campinas.webp",
    "293185017_1016084262417910_6325870842122377712_n.webp": "art-show-sonorizacao-igreja-campinas.webp",
    "374825600_231661136540240_4952089351693513140_n.webp": "art-show-projeto-igreja-campinas.webp",
    "613100333_18181645783362702_1956245873521371649_n.webp": "art-show-fernando-brandao-campinas.webp",
    "503673647_18159794491362702_4914966978490652816_n.webp": "art-show-sistema-profissional-campinas.webp",
    "619221047_18182455009362702_7887225675930888305_n.webp": "art-show-assistencia-tecnica-campinas.webp",
    "620976806_18182454397362702_3303142640832268658_n.webp": "art-show-equipamentos-audio-campinas.webp",
    "509625523_18159794470362702_4780033254899983658_n.webp": "art-show-instalacao-campinas.webp",
    "81336463_878843765852196_7848251766494612310_n.jpg": "art-show-oficina-campinas.webp",
    "350090559_265671312543127_6790261039290178527_n.webp": "art-show-equipamento-profissional-campinas.webp",
    "339326676_236347085721065_7841393625073304836_n.webp": "art-show-caixa-acustica-campinas.webp",
    "475232298_18146078692362702_8769153606323168882_n.webp": "art-show-projeto-especial-campinas.webp",
    "475254357_18146078830362702_7050389205150858589_n.webp": "art-show-instalacao-completa-campinas.webp",
    "475326366_18146078983362702_3701740997505269183_n.webp": "art-show-montagem-campinas.webp",
}


def build_mapping():
    """Constrói mapeamento completo: nome_antigo -> nome_novo."""
    allowed = {".jpg", ".jpeg", ".png", ".webp"}
    files = sorted(f.name for f in GALERIA.iterdir() if f.is_file() and f.suffix.lower() in allowed)
    mapping = {}
    galeria_counter = 1
    for f in files:
        if f in MAPEAMENTO_SEO:
            mapping[f] = MAPEAMENTO_SEO[f]
        else:
            mapping[f] = f"art-show-galeria-campinas-{galeria_counter:02d}.webp"
            galeria_counter += 1
    return mapping


def process_image(src_path: Path, dst_path: Path) -> bool:
    """Redimensiona, converte para WebP e comprime até <= MAX_BYTES."""
    img = Image.open(src_path).convert("RGB")
    w, h = img.size
    if w > MAX_WIDTH:
        ratio = MAX_WIDTH / w
        new_w = MAX_WIDTH
        new_h = int(h * ratio)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    for quality in range(85, MIN_QUALITY - 1, -10):
        img.save(dst_path, "WEBP", quality=quality, method=6)
        if dst_path.stat().st_size <= MAX_BYTES:
            return True
    # Última tentativa com qualidade mínima
    img.save(dst_path, "WEBP", quality=MIN_QUALITY, method=6)
    return dst_path.stat().st_size <= MAX_BYTES


def main():
    os.chdir(ROOT)
    mapping = build_mapping()
    print(f"Processando {len(mapping)} imagens...")
    for old_name, new_name in mapping.items():
        src = GALERIA / old_name
        if not src.exists():
            print(f"  [pular] {old_name} (não encontrado)")
            continue
        dst = GALERIA / new_name
        if src.resolve() == dst.resolve():
            continue
        try:
            ok = process_image(src, dst)
            size_kb = dst.stat().st_size / 1024
            status = "OK" if ok else ">200KB"
            print(f"  {old_name} -> {new_name} ({size_kb:.1f} KB) [{status}]")
        except Exception as e:
            print(f"  ERRO {old_name}: {e}")
            continue

    # Atualizar index.html
    index_path = ROOT / "index.html"
    html = index_path.read_text(encoding="utf-8")
    for old_name, new_name in mapping.items():
        html = html.replace(f"galeria/{old_name}", f"galeria/{new_name}")
        html = html.replace(
            f"https://www.artshow.com.br/galeria/{old_name}",
            f"https://www.artshow.com.br/galeria/{new_name}",
        )
    index_path.write_text(html, encoding="utf-8")
    print("index.html atualizado.")

    # Atualizar style.css
    css_path = ROOT / "style.css"
    css = css_path.read_text(encoding="utf-8")
    for old_name, new_name in mapping.items():
        css = css.replace(f"galeria/{old_name}", f"galeria/{new_name}")
    css_path.write_text(css, encoding="utf-8")
    print("style.css atualizado.")

    # Remover arquivos antigos (apenas os que foram renomeados)
    for old_name in mapping:
        if mapping[old_name] != old_name:
            old_path = GALERIA / old_name
            if old_path.exists():
                old_path.unlink()
                print(f"  removido: {old_name}")
    print("Concluído.")


if __name__ == "__main__":
    main()
