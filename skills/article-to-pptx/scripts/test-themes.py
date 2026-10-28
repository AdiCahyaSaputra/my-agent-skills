"""Build each preset in an isolated workspace and inspect the actual PPTX XML."""
import json
import subprocess
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
PRESETS = ['default', 'editorial-cream', 'swiss-signal', 'midnight-lab', 'nord-field',
           'botanical-paper', 'bauhaus-study', 'terminal-mint', 'rose-archive',
           'amber-dispatch', 'cobalt-atlas']


def build(*, directory, storyboard, succeeds=True):
    (directory / 'storyboard.json').write_text(json.dumps(storyboard))
    result = subprocess.run([str(ROOT / 'node_modules/.bin/tsx'), str(ROOT / 'scripts/build.ts')],
                            cwd=directory, capture_output=True, text=True)
    assert (result.returncode == 0) == succeeds, result.stdout + result.stderr
    return result


def contrast(first, second):
    def luminance(color):
        values = [int(color[i:i+2], 16) / 255 for i in (0, 2, 4)]
        linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
        return sum(v * weight for v, weight in zip(linear, (.2126, .7152, .0722)))

    values = sorted([luminance(first), luminance(second)])
    return (values[1] + .05) / (values[0] + .05)


with tempfile.TemporaryDirectory(prefix='article-pptx-themes-') as tmp:
    directory = Path(tmp)
    (directory / 'figure.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#426080"/></svg>')
    storyboard = json.loads((ROOT / 'examples/storyboard.example.json').read_text())
    storyboard['project']['approved'] = True  # Synthetic local fixture, not article approval.
    storyboard['assets'] = [{'id':'figure', 'origin':'original', 'file':'figure.svg'}]
    storyboard['slides'].extend([
        {'id':'split', 'type':'split', 'title':'Two connected ideas', 'imageId':'figure', 'bullets':['Explain the figure']},
        {'id':'image', 'type':'image', 'title':'A contained source figure', 'imageId':'figure', 'subtitle':'Caption'},
        {'id':'quote', 'type':'quote', 'title':'A short quotation', 'quote':'Evidence comes first.', 'speakerNotes':'Fixture note'}])
    storyboard['slides'][0]['imageId'] = 'figure'
    cover_positions = set()
    palettes = set()

    for preset in PRESETS:
        storyboard['project']['theme'] = {'preset':preset}
        build(directory=directory, storyboard=storyboard)

        with zipfile.ZipFile(directory / 'output/presentation.pptx') as archive:
            slides = [name for name in archive.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
            assert len(slides) == 8
            cover = ET.fromstring(archive.read('ppt/slides/slide1.xml'))
            bg = cover.find('.//p:bg//a:srgbClr', NS).attrib['val']
            text_colors = cover.findall('.//a:rPr/a:solidFill/a:srgbClr', NS)
            assert text_colors
            fg = text_colors[-1].attrib['val']
            assert contrast(bg, fg) >= 4.5, (preset, bg, fg)
            palettes.add((bg, fg))
            title = next(shape for shape in cover.findall('.//p:sp', NS)
                         if storyboard['slides'][0]['title'] in ''.join(shape.itertext()))
            position = title.find('.//a:xfrm', NS)
            cover_positions.add(ET.tostring(position))

            for name in slides:
                slide = ET.fromstring(archive.read(name))
                assert slide.findall('.//p:sp/p:txBody', NS), f'No editable text in {preset}/{name}'
                for shape in slide.findall('.//a:xfrm', NS):
                    offset, extent = shape.find('a:off', NS), shape.find('a:ext', NS)
                    if offset is None or extent is None:
                        continue
                    x, y = int(offset.attrib['x']), int(offset.attrib['y'])
                    w, h = int(extent.attrib['cx']), int(extent.attrib['cy'])
                    assert min(x, y, w, h) >= 0, (preset, name, x, y, w, h)
                    assert x + w <= 12192000 + 500 and y + h <= 6858000 + 500, (preset, name, x, y, w, h)

            process = ET.fromstring(archive.read('ppt/slides/slide3.xml'))
            assert len(process.findall('.//a:tailEnd', NS)) + len(process.findall('.//a:headEnd', NS)) >= 4
            assert b'Fixture note' in archive.read('ppt/notesSlides/notesSlide8.xml')

    assert len(cover_positions) == 11, 'Presets must have different cover geometry'
    assert len(palettes) == 11, 'Presets must have different palettes'

    storyboard['project']['theme'] = {'preset':'midnight-lab', 'background':'#FFFFFF', 'foreground':'#222222', 'accent':'#DC2626', 'fontFace':'Arial'}
    build(directory=directory, storyboard=storyboard)
    with zipfile.ZipFile(directory / 'output/presentation.pptx') as archive:
        cover = ET.fromstring(archive.read('ppt/slides/slide1.xml'))
        assert cover.find('.//p:bg//a:srgbClr', NS).attrib['val'] == 'FFFFFF'
        assert b'Arial' in archive.read('ppt/slides/slide1.xml')

    for theme in [{'preset':'unknown'}, {'accent':'invalid'}]:
        storyboard['project']['theme'] = theme
        build(directory=directory, storyboard=storyboard, succeeds=False)

    storyboard['project']['theme'] = {}
    storyboard['project']['approved'] = False
    build(directory=directory, storyboard=storyboard, succeeds=False)
    storyboard['project']['approved'] = True
    storyboard['assets'][0]['file'] = 'missing.svg'
    build(directory=directory, storyboard=storyboard, succeeds=False)

    storyboard = json.loads((ROOT / 'examples/storyboard.example.json').read_text())
    storyboard['project']['approved'] = True
    build(directory=directory, storyboard=storyboard)
    verification = subprocess.run([str(ROOT / 'node_modules/.bin/tsx'), str(ROOT / 'scripts/verify.ts')],
                                  cwd=directory, capture_output=True, text=True)
    assert verification.returncode == 0, verification.stdout + verification.stderr
    report = json.loads((directory / 'output/verification-report.json').read_text())
    assert report['status'] == 'PASS', report

print('PASS: 11 presets, 88 slides, distinct geometry/palettes, editable text, slide bounds, contrast, arrows, notes, overrides and rejection cases.')
