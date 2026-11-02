import fitz, sys, re, os
src, out = sys.argv[1], sys.argv[2]
for name, deck in [("L9 _ Graph Algorithms I","L9"),("L10 _ Graph Algorithms II","L10"),("L11 _ Graph Algorithms III","L11"),("L12 _ Dynamic Programming I","L12")]:
    d = fitz.open(os.path.join(src, name + ".pdf"))
    nums=[]
    for i,p in enumerate(d, start=1):
        pad = f"{i:02d}" if i < 100 else f"{i:03d}"
        pix = p.get_pixmap(matrix=fitz.Matrix(1.25,1.25)); pix.save(f"{out}/{deck}-{pad}.png")
        if i < 10: pix.save(f"{out}/{deck}-{i}.png")
        # printed number: bottom-right small number
        cand=None
        for b in p.get_text("words"):
            x0,y0,x1,y1,w=b[:5]
            if re.fullmatch(r"\d{1,3}", w) and y0 > p.rect.height*0.85 and x0 > p.rect.width*0.8: cand=int(w)
        nums.append(cand)
    print(deck, len(d), " ".join(f"{i+1}:{n}" for i,n in enumerate(nums) if n is None or n!=i+1))
