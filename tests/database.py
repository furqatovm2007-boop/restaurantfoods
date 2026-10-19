import sqlite3,pathlib
c=sqlite3.connect(':memory:');c.execute('PRAGMA foreign_keys=ON')
for p in sorted(pathlib.Path('drizzle').glob('*.sql')):c.executescript(p.read_text())
c.execute("INSERT INTO restaurants (id,name,status,tables,capacity,slots) VALUES ('r','Real test fixture','active',2,4,'[\"18:00\",\"20:00\"]')")
insert="INSERT INTO bookings (id,restaurant_id,user_id,date,slot,table_number,guests,phone,status,created_at) VALUES (?,'r','c','2030-01-01','18:00',1,2,'+998901234567',?,'now')"
c.execute(insert,('a','pending'))
try:c.execute(insert,('b','confirmed'));raise AssertionError('Duplicate booking accepted')
except sqlite3.IntegrityError:pass
c.execute("UPDATE bookings SET status='cancelled' WHERE id='a'");c.execute(insert,('b','pending'))
c.execute("INSERT INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('one','r','c',5,'Actual review','now','now')")
try:c.execute("INSERT INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('two','r','c',4,'Duplicate review','now','now')");raise AssertionError('Duplicate review accepted')
except sqlite3.IntegrityError:pass
c.execute("INSERT INTO reviews (id,restaurant_id,user_id,stars,comment,created_at,updated_at) VALUES ('two','r','d',3,'Second customer','now','now')")
assert c.execute("SELECT AVG(stars),COUNT(*) FROM reviews WHERE restaurant_id='r'").fetchone()==(4.,2)
sql='INSERT INTO rate_limits (key,window,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END, window=excluded.window RETURNING count'
assert c.execute(sql,('ip',1)).fetchone()[0]==1
assert c.execute(sql,('ip',1)).fetchone()[0]==2
assert c.execute(sql,('ip',2)).fetchone()[0]==1
print('PASS SQLite migrations, atomic slot uniqueness, capacity released on cancellation, one review per customer, real rating average, atomic rate limiter')
