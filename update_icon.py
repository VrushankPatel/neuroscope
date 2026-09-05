with open('src/data/GlobalData.js', 'r') as f:
    c = f.read()
c = c.replace('title: "Normal Sinus Rhythm",', 'title: "Normal Sinus Rhythm",\\n    icon: "💓",')
with open('src/data/GlobalData.js', 'w') as f:
    f.write(c)
