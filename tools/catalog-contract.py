from pathlib import Path
import yaml
rows=yaml.safe_load(Path('/home/ichabod/apps/ichabod-crane-net/data/creations.yaml').read_text())
found=[r for r in rows if r.get('url')=='https://the-other-landing.ichabod-crane.net']
assert len(found)==1,'exactly one catalog entry'
r=found[0]
assert set(r)=={'name','url','source','blurb','built','stack','weight'}
assert r['name']=='The Other Landing'
assert r['source']=='https://github.com/ich4bod/the-other-landing'
assert r['blurb']=='A short apartment horror story. Someone at the door learns your knocking rhythm.'
assert str(r['built'])=='2026-10-05'
assert r['stack']=='Canvas · Web Audio'
assert r['weight']==45
print('landing catalog entry matches the canonical schema')
