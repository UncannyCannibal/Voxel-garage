"""Client for srv.py.  q.py eval '<js>' [argjson] | q.py evalf file.js [argjson] | q.py reload [nobuild] | q.py shot out.png '<camjson>' [js] | q.py quit
A file passed to evalf holds one JS function expression; it is called with the parsed arg. Its return value is printed (strings as they are, the rest as JSON)."""
import sys, os, json, socket
PORT = int(os.environ.get('VG_PORT', '8765'))
a = sys.argv[1:]
if not a: print(__doc__); sys.exit(1)
op = a[0]
if op == 'eval': req = {'op': 'eval', 'js': a[1], 'arg': json.loads(a[2]) if len(a) > 2 else None}
elif op == 'evalf': req = {'op': 'eval', 'js': open(a[1], encoding='utf-8').read(), 'arg': json.loads(a[2]) if len(a) > 2 else None}
elif op == 'reload': req = {'op': 'reload', 'build': not (len(a) > 1 and a[1] == 'nobuild')}
elif op == 'shot': req = {'op': 'shot', 'path': os.path.abspath(a[1]), 'cam': json.loads(a[2]), 'js': a[3] if len(a) > 3 else None}
else: req = {'op': op}
s = socket.create_connection(('127.0.0.1', PORT), timeout=3600); s.sendall(json.dumps(req).encode()); s.shutdown(socket.SHUT_WR)
buf = b''
while True:
    c = s.recv(1 << 20)
    if not c: break
    buf += c
r = json.loads(buf)
if r.get('ok'):
    res = r['res']; print(res if isinstance(res, str) else json.dumps(res))
else:
    print('ERROR', r.get('err')); sys.exit(1)
