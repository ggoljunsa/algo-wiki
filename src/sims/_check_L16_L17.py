# 검산: L16 Karger 예제(p.20) 성공률, 무작위 cut 확률, 반복 횟수 / L17 Ford-Fulkerson 예제(p.43-53)
import random, math, itertools
E=[("a","b"),("a","c"),("a","d"),("b","c"),("b","d"),("b","e"),("c","d"),("d","e"),
   ("e","f"),("e","g"),("e","h"),("f","g"),("f","h"),("g","h")]
V=sorted({x for e in E for x in e})
def cutsize(S): return sum((u in S)!=(v in S) for u,v in E)
best=min(cutsize(set(c)) for r in range(1,len(V)) for c in itertools.combinations(V,r))
mins=[set(c) for r in range(1,len(V)) for c in itertools.combinations(V,r) if cutsize(set(c))==best]
print("min cut size",best,"min cuts(ordered sides)",len(mins),[sorted(m) for m in mins])
def karger(rng):
    comp={v:v for v in V}; F=list(E); n=len(V)
    def f(x):
        while comp[x]!=x: x=comp[x]
        return x
    while n>2:
        u,v=rng.choice(F); comp[f(v)]=f(u); n-=1
        F=[(a,b) for a,b in F if f(a)!=f(b)]
    return len(F)
rng=random.Random(1); N=100000
succ=sum(karger(rng)==best for _ in range(N))/N
print("Karger success",succ)
print("random cut",2/(2**8-2),"1/p",(2**8-2)/2)
print("lower bound 1/C(8,2)",1/math.comb(8,2))
print("(0.8)^5",0.8**5,"(0.8)^10",0.8**10)
print("T for 0.99 with p=1/28:",math.comb(8,2)*math.log(100))
# Ford-Fulkerson, slide path order
cap={("s","A"):4,("s","B"):2,("s","C"):6,("A","D"):3,("A","E"):6,("B","E"):3,("F","B"):3,("C","F"):10,("D","t"):4,("E","t"):4,("F","t"):4}
f={e:0 for e in cap}
def res(u,v):
    if (u,v) in cap: return cap[(u,v)]-f[(u,v)]
    if (v,u) in cap: return f[(v,u)]
    return 0
paths=[["s","A","E","t"],["s","C","F","t"],["s","B","E","A","D","t"],["s","C","F","B","E","A","D","t"]]
for P in paths:
    x=min(res(P[i],P[i+1]) for i in range(len(P)-1))
    for i in range(len(P)-1):
        u,v=P[i],P[i+1]
        if (u,v) in cap: f[(u,v)]+=x
        else: f[(v,u)]-=x
    print("path","".join(P),"x",x,"value",sum(f[e] for e in cap if e[0]=="s"))
print("final flow",f)
# reachable in Gf
R={"s"};st=["s"];N2={x for e in cap for x in e}
while st:
    u=st.pop()
    for v in N2:
        if v not in R and res(u,v)>0: R.add(v);st.append(v)
print("reachable",sorted(R),"cut cap",sum(c for (u,v),c in cap.items() if u in R and v not in R))
