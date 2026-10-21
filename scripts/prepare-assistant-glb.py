"""Prepare the uploaded Robot Playground for a transparent assistant overlay.
The source stays unchanged. Remove the decorative holo/ground branch and its
animation tracks; preserve the robot skin, rig, textures and animation data.
"""
import json, struct, sys
from pathlib import Path
source=Path(sys.argv[1]); target=Path(sys.argv[2])
raw=source.read_bytes()
magic,version,total=struct.unpack_from('<III',raw)
assert magic==0x46546c67 and version==2 and total==len(raw)
length,kind=struct.unpack_from('<II',raw,12)
assert kind==0x4e4f534a
doc=json.loads(raw[20:20+length]); nodes=doc['nodes']
roots={i for i,n in enumerate(nodes) if n.get('name')=='holo'}
assert len(roots)==1 and any(n.get('name')=='bot_geo' for n in nodes)
excluded=set()
def visit(i):
 if i in excluded:return
 excluded.add(i)
 for child in nodes[i].get('children',[]):visit(child)
for i in roots:visit(i)
for node in nodes:
 if 'children' in node:node['children']=[i for i in node['children'] if i not in excluded]
for scene in doc['scenes']:scene['nodes']=[i for i in scene['nodes'] if i not in excluded]
for animation in doc.get('animations',[]):animation['channels']=[c for c in animation['channels'] if c['target']['node'] not in excluded]
# Assign explicit materials by robot part; the source's full-white emissive
# atlas washes out the entire character under the assistant renderer lighting.
def linear(hexcolor):
 rgb=[int(hexcolor[i:i+2],16)/255 for i in (0,2,4)]
 return [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
palette={}
for name,color,metal,rough,emission in [
 ('emerald','00c9a7',.35,.34,[0,0,0]),('gold','e5bd6e',.65,.28,[0,0,0]),
 ('pearl','e5f4ef',.25,.38,[0,0,0]),('graphite','123744',.4,.35,[0,0,0]),
 ('eyes','22f1c2',.1,.24,[0,.35,.2])]:
 palette[name]=len(doc['materials']);doc['materials'].append({'name':'RF '+name,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':linear(color)+[1],'metallicFactor':metal,'roughnessFactor':rough},'emissiveFactor':emission})
for mesh in doc['meshes']:
 name=mesh.get('name','').lower()
 if not name.endswith('_bot_0'):continue
 color='eyes' if name.startswith(('eye','happy','smile','o_','close_')) else 'gold' if any(part in name for part in ('shoulder','ear','topheadball')) else 'graphite' if any(part in name for part in ('knee','hip','neck','tube')) else 'pearl' if any(part in name for part in ('hand','finger','index','thumb','pinky','upperleg')) else 'emerald'
 for primitive in mesh['primitives']:primitive['material']=palette[color]
doc['asset'].setdefault('extras',{})['modifications']='Decorative holo/ground scene branch excluded for a transparent assistant overlay; robot rig and animation retained; emerald, gold, pearl and graphite materials applied.'
data=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();data+=b' '*((-len(data))%4)
rest=raw[20+length:];result=struct.pack('<III',magic,version,20+len(data)+len(rest))+struct.pack('<II',len(data),kind)+data+rest
target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(result)
print(f'Prepared {target}: {len(result)} bytes, {len(excluded)} decorative nodes excluded; source unchanged.')
