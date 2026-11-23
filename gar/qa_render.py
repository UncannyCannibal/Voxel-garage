#!/usr/bin/env python3
"""Unified QA renderer. One renderer, one framing rule, for EVERY asset (cars and robots).
Input JSON: {"name":..., "unit_mm":10, "voxels":[[x,y,z,size,rgb_int,part?],...]}   (y is up)
Output: 4 PNGs (3/4 front, side, top, 3/4 rear) + a labelled contact sheet. Object always fills >= 78% of the frame.
Shading: per-voxel normal from the local occupancy gradient, so surfaces read as solid (not scatter dots)."""
import json,sys,math
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import uniform_filter
def load(p):
    d=json.load(open(p));a=np.array([[v[0],v[1],v[2],v[3],v[4]] for v in d['voxels']],dtype=np.float64);return d,a
def normals(P,S):
    # pad 4 cells on every side and filter with zeros outside: surfaces on the edge of the bounding box (a roof, a bumper face) must not see a reflected copy of themselves
    PAD=4
    lat=np.round(P*2).astype(int);lat-=lat.min(0)
    occ=np.zeros(lat.max(0)+2*PAD+1,dtype=np.float32);occ[lat[:,0]+PAD,lat[:,1]+PAD,lat[:,2]+PAD]=1
    den=uniform_filter(occ,5,mode='constant');gx,gy,gz=np.gradient(den)
    ix=(lat[:,0]+PAD,lat[:,1]+PAD,lat[:,2]+PAD)
    n=-np.stack([gx[ix],gy[ix],gz[ix]],1)
    l=np.linalg.norm(n,axis=1,keepdims=True);n=np.where(l>1e-6,n/np.maximum(l,1e-6),0);return n
def render(a,yaw,pitch,W=1000,H=640,bg=(205,210,216),fill=.8,zoom_box=None):
    P=a[:,:3];S=a[:,3];C=np.stack([(a[:,4].astype(int)>>16)&255,(a[:,4].astype(int)>>8)&255,a[:,4].astype(int)&255],1).astype(np.float64)
    N=normals(P,S)
    cy,sy=math.cos(math.radians(yaw)),math.sin(math.radians(yaw));cp,sp=math.cos(math.radians(pitch)),math.sin(math.radians(pitch))
    Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]);Rx=np.array([[1,0,0],[0,cp,-sp],[0,sp,cp]])
    R=Rx@Ry
    Q=P@R.T;Nn=N@R.T
    sel=np.ones(len(P),bool)
    if zoom_box is not None: lo,hi=zoom_box;sel=np.all((P>=lo)&(P<=hi),1)
    Qs=Q[sel]
    mn=Qs.min(0);mx=Qs.max(0);ext=mx-mn
    s=min(W*fill/ext[0],H*fill/ext[1])
    u=((Q[:,0]-(mn[0]+mx[0])/2)*s+W/2);v=(H/2-(Q[:,1]-(mn[1]+mx[1])/2)*s)
    depth=-Q[:,2]
    light=np.array([-.45,.8,.55]);light/=np.linalg.norm(light)
    lam=np.clip(Nn@light,0,1);flat=np.linalg.norm(Nn,axis=1)<1e-6
    shade=np.where(flat,.75,.38+.62*lam)
    col=np.clip(C*shade[:,None]*1.02,0,255)
    img=np.zeros((H,W,3));img[:]=bg;zb=np.full((H,W),np.inf)
    ok=np.where(sel)[0];order=ok[np.argsort(-depth[ok])]   # far first, so the nearest voxel is written last
    px=np.maximum(1,np.round(S*s*1.35)).astype(int)
    for k in range(1,int(px[order].max())+1):
        m=order[px[order]>=k]
        for dx in range(k):
            for dy in range(k):
                uu=np.round(u[m]).astype(int)+dx-k//2;vv=np.round(v[m]).astype(int)+dy-k//2
                g=(uu>=0)&(uu<W)&(vv>=0)&(vv<H);mm=m[g];uu=uu[g];vv=vv[g]
                dd=depth[mm];better=dd<zb[vv,uu]
                zb[vv[better],uu[better]]=dd[better];img[vv[better],uu[better]]=col[mm[better]]
    return Image.fromarray(img.astype(np.uint8)),s
def main(p,out='qa'):
    d,a=load(p);views=[('3/4 front',-35,24),('side',0,0),('top',0,90),('3/4 rear',145,24)]
    ims=[]
    for name,yaw,pitch in views:
        im,s=render(a,yaw,pitch);dr=ImageDraw.Draw(im);dr.text((12,10),d['name']+'  |  '+name,fill=(20,20,20))
        mm100=s*100/d['unit_mm'];dr.rectangle([12,im.height-24,12+mm100,im.height-20],fill=(20,20,20));dr.text((12,im.height-40),'100 mm',fill=(20,20,20))
        im.save(f'{out}_{name.replace("/","").replace(" ","_")}.png');ims.append(im)
    sheet=Image.new('RGB',(ims[0].width*2,ims[0].height*2))
    for i,im in enumerate(ims):sheet.paste(im,((i%2)*im.width,(i//2)*im.height))
    sheet.save(f'{out}_sheet.png');print('wrote',out+'_sheet.png',sheet.size)
if __name__=='__main__':main(sys.argv[1],sys.argv[2] if len(sys.argv)>2 else 'qa')
