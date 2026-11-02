"""Encode actual capture-demo frames; requires Pillow in a separate tooling env."""
from pathlib import Path
from PIL import Image
frames = [Image.open(path).convert('RGB') for path in sorted(Path('test-results/demo-capture').glob('*.png'))]
if len(frames) != 6 or len({frame.size for frame in frames}) != 1:
    raise SystemExit('Expected six equal-sized real browser frames')
frames[0].save('docs/media/interaction.gif', save_all=True, append_images=frames[1:], duration=[1000, 700, 800, 1400, 800, 1000], loop=0, optimize=True)
print('Encoded actual Vue 3 interaction GIF:', Path('docs/media/interaction.gif').stat().st_size, 'bytes')
