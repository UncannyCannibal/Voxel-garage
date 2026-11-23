# publish copy of the built page: the artifact host adds the document skeleton, so the wrapper tags go and the title is the page's name
import os
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'out')
s=open(os.path.join(OUT,'garage.html'),encoding='utf-8').read()
for t in ['<!DOCTYPE html>\n','<html lang="en">\n','<head>\n','<meta charset="utf-8">\n','<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n','</head>\n','<body>\n','</body>\n','</html>\n']:
    assert t in s,t; s=s.replace(t,'',1)
s=s.replace('<title>Garage: build any car</title>','<title>Voxel Garage</title>',1)
open(os.path.join(OUT,'garage_pub.html'),'w',encoding='utf-8').write(s);print('pub',len(s)//1000,'KB')
