import os
from PIL import Image, ImageDraw

os.makedirs('icons', exist_ok=True)

def create_icon(size):
    # Create an image with rounded background gradient
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background rounded rect
    margin = int(size * 0.05)
    radius = int(size * 0.22)
    
    # Gradient-like background (Indigo to Purple)
    for i in range(size - 2 * margin):
        ratio = i / float(size - 2 * margin)
        r = int(79 + (124 - 79) * ratio)
        g = int(70 + (58 - 70) * ratio)
        b = int(229 + (237 - 229) * ratio)
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=radius,
            fill=(r, g, b, 255)
        )
    
    # Draw book / journal silhouette
    cx = size // 2
    cy = size // 2
    
    # Outer book page
    bw = int(size * 0.52)
    bh = int(size * 0.6)
    bx1 = cx - bw // 2
    by1 = cy - bh // 2 - int(size * 0.02)
    bx2 = cx + bw // 2
    by2 = cy + bh // 2 - int(size * 0.02)
    
    # Book covers / pages
    draw.rounded_rectangle([bx1, by1, bx2, by2], radius=int(size * 0.05), fill=(255, 255, 255, 245))
    draw.line([cx, by1, cx, by2], fill=(210, 215, 230, 255), width=max(1, int(size * 0.015)))
    
    # Horizontal lines on right page to symbolize writing
    lw = int(bw * 0.3)
    for ly in [by1 + int(bh * 0.25), by1 + int(bh * 0.4), by1 + int(bh * 0.55)]:
        draw.line([cx + int(bw * 0.1), ly, cx + int(bw * 0.1) + lw, ly], fill=(180, 190, 210, 255), width=max(1, int(size * 0.015)))

    # Microphone badge in bottom-right corner
    mr = int(size * 0.16)
    mcx = cx + int(size * 0.18)
    mcy = cy + int(size * 0.18)
    draw.ellipse([mcx - mr, mcy - mr, mcx + mr, mcy + mr], fill=(236, 72, 153, 255))
    
    # Mic body inside badge
    mw = int(mr * 0.4)
    mh = int(mr * 0.8)
    draw.rounded_rectangle([mcx - mw, mcy - mh, mcx + mw, mcy + int(mh * 0.2)], radius=mw, fill=(255, 255, 255, 255))
    # Mic arc
    draw.arc([mcx - int(mw * 1.6), mcy - int(mh * 0.3), mcx + int(mw * 1.6), mcy + int(mh * 0.5)], start=0, end=180, fill=(255, 255, 255, 255), width=max(1, int(size * 0.012)))
    draw.line([mcx, mcy + int(mh * 0.5), mcx, mcy + int(mh * 0.8)], fill=(255, 255, 255, 255), width=max(1, int(size * 0.012)))
    draw.line([mcx - int(mw * 0.8), mcy + int(mh * 0.8), mcx + int(mw * 0.8), mcy + int(mh * 0.8)], fill=(255, 255, 255, 255), width=max(1, int(size * 0.012)))
    
    img.save(f'icons/icon-{size}.png', 'PNG')
    print(f'Saved icons/icon-{size}.png')

create_icon(192)
create_icon(512)
