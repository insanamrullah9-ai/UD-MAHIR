/* ============ FIREBASE ============ */
const firebaseConfig={
  apiKey:"AIzaSyAapxWih82W-cp8sVnnSCJ6H-WRpkpRqQs",
  authDomain:"usaha-ayam-mahir.firebaseapp.com",
  projectId:"usaha-ayam-mahir",
  storageBucket:"usaha-ayam-mahir.firebasestorage.app",
  messagingSenderId:"673382358772",
  appId:"1:673382358772:web:2b15852fce823b241b88a1",
  measurementId:"G-FT31SHGV9C"
};
let auth,fs,st,FV;
try{firebase.initializeApp(firebaseConfig);auth=firebase.auth();fs=firebase.firestore();st=firebase.storage();FV=firebase.firestore.FieldValue}
catch(e){document.getElementById('app').innerHTML='<p style="padding:40px 16px;text-align:center;font-family:system-ui,sans-serif">Gagal memuat Firebase. Periksa koneksi internet lalu muat ulang halaman.</p>';throw e}

/* ============ UTIL ============ */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp=n=>'Rp'+Math.round(n||0).toLocaleString('id-ID');
const fmtN=n=>+(+n||0).toFixed(2);
const fmtD=t=>new Date(t).toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const fmtDay=t=>new Date(t).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
const uid=()=>Math.random().toString(36).slice(2,10);
const clean=o=>JSON.parse(JSON.stringify(o));
const logo=(s=36)=>(typeof db!=='undefined'&&db&&db.settings&&db.settings.logo)?`<img src="${esc(db.settings.logo)}" width="${s}" height="${s}" alt="Logo" style="border-radius:10px;object-fit:cover">`:`<svg width="${s}" height="${s}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="10" fill="#9C3A28"/><path d="M0 41l6-6 6 6 6-6 6 6 6-6 6 6 6-6v13H0z" fill="#B8913A"/><ellipse cx="22" cy="25" rx="12" ry="9" fill="#fff"/><circle cx="31" cy="15" r="6.5" fill="#fff"/><path d="M28 10q1-6 4-2 2-4 4 1z" fill="#E8B84B"/><path d="M37 14l6 2.5-6 2z" fill="#E8B84B"/><circle cx="32.5" cy="14" r="1.3" fill="#2B1F18"/><path d="M12 22q-7-2-6-9 6 1 9 7z" fill="#fff"/></svg>`;
const NOW=()=>Date.now();
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;$('#toasts').appendChild(e);setTimeout(()=>e.remove(),3200)}
function modal(html){$('#modal').innerHTML=`<div class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`}
function closeModal(){$('#modal').innerHTML=''}
const V=id=>{const e=document.getElementById(id);return e?e.value:''};
function readImg(file,max=800){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.78))};im.src=r.result};r.readAsDataURL(file)})}
async function upImg(path,file,max){const d=await readImg(file,max);const r=st.ref(path);await r.putString(d,'data_url');return await r.getDownloadURL()}
const AE=e=>({'auth/invalid-credential':'Email atau password tidak sesuai.','auth/wrong-password':'Email atau password tidak sesuai.','auth/user-not-found':'Email atau password tidak sesuai.','auth/invalid-email':'Format email tidak valid.','auth/email-already-in-use':'Pendaftaran tidak dapat diproses. Coba email lain atau masuk.','auth/weak-password':'Password minimal 8 karakter.','auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.','auth/network-request-failed':'Koneksi bermasalah. Periksa internet Anda.','auth/operation-not-allowed':'Login email/password belum diaktifkan di Firebase Console.','auth/requires-recent-login':'Silakan login ulang lalu coba lagi.'}[e&&e.code]||'Terjadi kesalahan ('+((e&&e.code)||'?')+').');
function fail(e){console.error(e);toast(e&&e.code==='permission-denied'?'Akses ditolak oleh aturan database.':'Gagal menyimpan: '+((e&&e.code)||'periksa koneksi'))}

/* ============ DATA & STATE ============ */
const CS='asl_cart_v1';
const CATS0=[['ayam-potong','Ayam Potong','🐔'],['ayam-kampung','Ayam Kampung','🐓'],['potongan','Potongan Ayam','🍗'],['paket-hemat','Paket Hemat','📦'],['paket-grosir','Paket Grosir','🏪']];
const KEC=[['Selong',5000],['Masbagik',7000],['Sukamulia',7000],['Suralaga',8000],['Pringgasela',10000],['Aikmel',10000],['Labuhan Haji',8000],['Pringgabaya',12000],['Sikur',12000],['Terara',12000],['Sakra',15000],['Keruak',15000],['Jerowaru',20000],['Sembalun',20000]];
const KEC0=['Wanasaba','Lenek','Montong Gading','Sakra Barat','Sakra Timur','Suela','Sambelia'];
const defaultZones=()=>[...KEC.map(k=>({k:k[0],fee:k[1],cod:true,active:true})),...KEC0.map(k=>({k,fee:0,cod:true,active:false}))];
const DEFS={name:'AYAM SEGAR LOTIM',slogan:'Segar Ayamnya, Puas Belanjanya.',wa:'',email:'',address:'',maps:'',hoursText:'Senin–Sabtu 06.00–20.00 · Minggu 06.00–18.00',ig:'',fb:'',tt:'',logo:'',open:true,acceptClosed:true,minTotal:25000,freeMinTotal:100000,freeMinKg:5,cod:true,silver:2,gold:5,slots:['Pagi 06.00–09.00','Siang 09.00–13.00','Sore 13.00–17.00']};
function seed(){
 const P=[['Ayam Potong Utuh','ayam-potong','kg',39000,80,'🐔'],['Ayam Potong Bersih','ayam-potong','kg',41000,60,'🐔'],['Ayam Kampung','ayam-kampung','kg',75000,25,'🐓'],['Dada Ayam','potongan','kg',45000,30,'🍗'],['Paha Atas','potongan','kg',40000,30,'🍗'],['Paha Bawah','potongan','kg',38000,30,'🍗'],['Sayap','potongan','kg',42000,20,'🍗'],['Ceker','potongan','kg',25000,15,'🦶'],['Kepala Ayam','potongan','kg',12000,12,'🐔'],['Jeroan','potongan','kg',18000,8,'🍖'],['Kulit Ayam','potongan','kg',20000,6,'🍗'],['Tulang Ayam','potongan','kg',10000,20,'🦴'],['Fillet Ayam','potongan','kg',52000,18,'🥩'],['Ayam Frozen','ayam-potong','kg',36000,40,'❄️'],['Paket Ayam Hemat','paket-hemat','paket',85000,10,'📦'],['Paket Warung Sasak','paket-hemat','paket',110000,10,'📦'],['Paket Keluarga Lotim','paket-hemat','paket',85000,10,'📦'],['Paket Grosir Warung','paket-grosir','paket',350000,6,'🏪']];
 const desc={'Paket Warung Sasak':'Ayam 2 kg + Ceker 500 g + Kepala 500 g.','Paket Keluarga Lotim':'Ayam 1 kg + Dada 500 g + Sayap 500 g.','Paket Grosir Warung':'Ayam 10 kg+ untuk warung dan rumah makan.','Paket Ayam Hemat':'Paket ayam hemat untuk kebutuhan harian.'};
 const t0=NOW();
 return{products:P.map((x,i)=>({id:'p'+(i+1),ord:i+1,slug:x[0].toLowerCase().replace(/[^a-z0-9]+/g,'-'),name:x[0],cat:x[1],unit:x[2],price:x[3],wholesale:x[2]==='kg'?x[3]-3000:0,promo:null,tiers:i===0?[{min:5,price:37000},{min:10,price:35000},{min:20,price:33000}]:[],stock:x[4],min:10,active:true,deleted:false,emoji:x[5],desc:desc[x[0]]||'Ayam segar dari usaha lokal Lombok Timur, diproses higienis. (DATA DEMO)',updated:t0})),
 zones:defaultZones(),
 vouchers:[{code:'LOTIMHEMAT',type:'persen',value:5,min:50000,active:true},{code:'ONGKIRGRATIS',type:'gratis_ongkir',value:0,min:30000,active:true}],
 banners:[{id:'bn1',title:'PROMO LOTIM HEMAT',desc:'Ayam Potong Utuh harga spesial. Atur dari dashboard admin. (DATA DEMO)',btn:'Lihat promo',link:'#/produk',img:'',active:true}],
 cats:CATS0.map(c=>({id:c[0],name:c[1],icon:c[2],active:true})),
 banks:[{id:'b1',bank:'BANK DEMO',no:'0000000000',holder:'DATA DEMO — WAJIB DIGANTI',demo:true}],
 qris:{img:'',merchant:'',mid:''},settings:Object.assign({},DEFS)};
}
let db={products:[],cats:CATS0.map(c=>({id:c[0],name:c[1],icon:c[2],active:true})),zones:defaultZones(),banners:[],banks:[],qris:{img:'',merchant:'',mid:''},settings:Object.assign({},DEFS),vouchers:[],orders:[],users:[],reviews:[],audit:[],priceHistory:[],notifs:[],anotifs:[],addr:[]};
let CATS=[];const refreshCats=()=>{CATS=db.cats.filter(c=>c.active).map(c=>[c.id,c.name,c.icon])};refreshCats();
let cart=(()=>{try{return JSON.parse(localStorage.getItem(CS))||[]}catch(e){return[]}})();
const saveCart=()=>{try{localStorage.setItem(CS,JSON.stringify(cart))}catch(e){}};
const S=()=>db.settings;
let CUR=null,FBU=null,READY=false,CFGX=false,ulKey='';
const RD={auth:false,cfg:false,prods:false,prof:false,ord:false};
const subs={ul:[],prof:null};
const me=()=>CUR&&CUR.active!==false?CUR:null;
const isAdm=u=>!!u&&(u.role==='admin'||u.role==='super_admin')&&u.active!==false;
const audit=(a,d)=>{const u=me();if(!isAdm(u))return;fs.collection('audit').add({t:NOW(),by:u.email,a,d:d||''}).catch(()=>{})};
const notif=(to,text)=>{fs.collection('notifs').add({to,text,t:NOW(),read:false}).catch(()=>{})};
const saveCfg=()=>fs.collection('config').doc('main').set(clean({settings:db.settings,cats:db.cats,zones:db.zones,banners:db.banners,banks:db.banks,qris:db.qris})).catch(fail);
const waitMe=()=>new Promise(r=>{let n=0;const t=setInterval(()=>{if(CUR||++n>40){clearInterval(t);r(CUR)}},75)});

function tick(){
 if(!READY){if(RD.auth&&RD.cfg&&RD.prods&&(!FBU||(RD.prof&&(!CUR||RD.ord)))){READY=true;router()}return}
 liveRefresh()}
let lrT=null;
function liveRefresh(){
 if(!READY)return;clearTimeout(lrT);lrT=setTimeout(()=>{
  if($('#modal').innerHTML)return;const a=document.activeElement;if(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))return;
  if(/^#\/(admin\/(dashboard|orders)|akun\/pesanan)$/.test(location.hash))router()},180)}

/* ============ LISTENERS ============ */
fs.collection('config').doc('main').onSnapshot(s=>{
 CFGX=s.exists;const d=s.exists?s.data():{};
 db.settings=Object.assign({},DEFS,d.settings||{});
 db.cats=d.cats||CATS0.map(c=>({id:c[0],name:c[1],icon:c[2],active:true}));db.zones=d.zones||defaultZones();db.banners=d.banners||[];db.banks=d.banks||[];db.qris=d.qris||{img:'',merchant:'',mid:''};
 refreshCats();RD.cfg=true;tick()},e=>{console.error(e);RD.cfg=true;tick()});
fs.collection('products').onSnapshot(s=>{
 db.products=s.docs.map(d=>d.data()).sort((a,b)=>(a.ord||1e15)-(b.ord||1e15)||String(a.name).localeCompare(b.name));RD.prods=true;tick()},e=>{console.error(e);RD.prods=true;tick()});
fs.collection('reviews').orderBy('created','desc').limit(200).onSnapshot(s=>{db.reviews=s.docs.map(d=>d.data());if(READY)liveRefresh()},e=>console.error(e));

auth.onAuthStateChanged(u=>{
 FBU=u;CUR=null;ulKey='';RD.auth=true;RD.ord=false;
 if(subs.prof){subs.prof();subs.prof=null}subs.ul.forEach(f=>f());subs.ul=[];
 db.orders=[];db.users=[];db.notifs=[];db.anotifs=[];db.addr=[];db.vouchers=[];db.audit=[];db.priceHistory=[];
 if(!u){RD.prof=true;if(READY)router();else tick();return}
 RD.prof=false;let first=true,wasAdm=false;
 subs.prof=fs.collection('users').doc(u.uid).onSnapshot(s=>{
  const had=!!CUR,hadAdm=wasAdm;
  if(s.exists){CUR=Object.assign({id:u.uid},s.data());
   if(CUR.active===false){toast('Akun Anda dinonaktifkan.');auth.signOut();return}
   if(first){first=false;fs.collection('users').doc(u.uid).update({last:NOW()}).catch(()=>{})}
   wasAdm=isAdm(CUR);startUserListeners()}
  else{CUR=null;RD.ord=true}
  RD.prof=true;
  if(!READY)tick();else if(had!==!!CUR||hadAdm!==wasAdm)router();else liveRefresh()},
  e=>{console.error(e);RD.prof=true;RD.ord=true;tick()})});

function startUserListeners(){
 const adm=isAdm(CUR),key=CUR.id+':'+adm;if(ulKey===key)return;ulKey=key;
 subs.ul.forEach(f=>f());subs.ul=[];db.orders=[];RD.ord=false;
 const uid_=CUR.id,L=(q,fn)=>subs.ul.push(q.onSnapshot(fn,e=>{console.error(e);if(!RD.ord){RD.ord=true;tick()}}));
 L(fs.collection('vouchers'),s=>{db.vouchers=s.docs.map(d=>d.data());if(READY)liveRefresh()});
 L(fs.collection('notifs').where('to','==',uid_),s=>{db.notifs=s.docs.map(d=>d.data()).sort((a,b)=>b.t-a.t).slice(0,30)});
 L(fs.collection('users').doc(uid_).collection('addresses'),s=>{db.addr=s.docs.map(d=>Object.assign({},d.data(),{uid:uid_}))});
 const ordCb=s=>{db.orders=s.docs.map(d=>d.data()).sort((a,b)=>b.created-a.created);if(!RD.ord){RD.ord=true;tick()}else liveRefresh()};
 if(adm){
  L(fs.collection('orders').orderBy('created','desc').limit(500),ordCb);
  L(fs.collection('users'),s=>{db.users=s.docs.map(d=>Object.assign({id:d.id},d.data()))});
  L(fs.collection('audit').orderBy('t','desc').limit(150),s=>{db.audit=s.docs.map(d=>d.data())});
  L(fs.collection('priceHistory').orderBy('t','desc').limit(50),s=>{db.priceHistory=s.docs.map(d=>d.data())});
  L(fs.collection('notifs').where('to','==','admin'),s=>{db.anotifs=s.docs.map(d=>d.data()).sort((a,b)=>b.t-a.t).slice(0,50);if(READY)liveRefresh()});
 }else{
  db.users=[CUR];
  L(fs.collection('orders').where('uid','==',uid_),ordCb);
 }}

/* ============ AUTH ============ */
async function doLogin(email,pw,admin,remember){
 try{
  await auth.setPersistence(remember?firebase.auth.Auth.Persistence.LOCAL:firebase.auth.Auth.Persistence.SESSION);
  const c=await auth.signInWithEmailAndPassword(email.trim(),pw);
  const ref=fs.collection('users').doc(c.user.uid);let s=await ref.get();
  if(!s.exists){await ref.set({name:c.user.displayName||String(c.user.email).split('@')[0],email:c.user.email,phone:'',role:'customer',level:'regular',wholesale:false,active:true,created:NOW(),last:NOW(),wish:[],wsReq:false});s=await ref.get()}
  const d=s.data();
  if(d.active===false){await auth.signOut();return'Akun Anda dinonaktifkan.'}
  if(admin&&!(d.role==='admin'||d.role==='super_admin')){await auth.signOut();return'Email atau password tidak sesuai, atau akun ini bukan admin.'}
  return null}catch(e){return AE(e)}}
async function logout(){const u=me();if(u)audit(isAdm(u)?'Admin logout':'Logout',u.email);try{await auth.signOut()}catch(e){}toast('Anda telah keluar.');location.hash=isAdm(u)?'#/admin/login':'#/'}

/* ============ PRICING ============ */
const prod=id=>db.products.find(p=>p.id===id);
const live=()=>db.products.filter(p=>p.active&&!p.deleted);
function promoOn(p){const x=p.promo;if(!x||!x.price)return false;const n=NOW();return(!x.start||n>=new Date(x.start).getTime())&&(!x.end||n<=new Date(x.end).getTime()+864e5)}
function baseTier(p,qty){let b=p.price;[...(p.tiers||[])].sort((a,c)=>c.min-a.min).some(t=>{if(qty>=t.min){b=t.price;return true}});return b}
function priceFor(p,qty,u){let b=baseTier(p,qty);if(promoOn(p))b=Math.min(b,p.promo.price);if(u&&u.wholesale&&p.wholesale)b=Math.min(b,p.wholesale);if(u){const d=u.level==='gold'?S().gold:u.level==='silver'?S().silver:0;b=b*(1-d/100)}return Math.round(b)}
const unitLbl=u=>({kg:'kg','500g':'500 g','250g':'250 g',ekor:'ekor',paket:'paket'}[u]||u);
function stockSt(s){return s<=0?['❌ Habis','b']:s<5?['🔴 Hampir habis','b']:s<=10?['🟡 Stok terbatas','w']:['🟢 Tersedia','ok']}
const step=p=>p.unit==='kg'?0.1:1;

/* ============ SHELL ============ */
function cartCount(){return cart.length}
function waLink(text){const n=(S().wa||'').replace(/\D/g,'');if(!n)return null;return'https://wa.me/'+n+'?text='+encodeURIComponent(text)}
function openWA(text){const l=waLink(text);if(!l){toast('Nomor WhatsApp belum diatur admin (Admin → Pengaturan).');return}window.open(l,'_blank','noopener')}
function shell(inner,active){
 const u=me();
 return `${!CFGX?`<div class="demo noprint">Database toko belum diisi. Admin: login lalu buka Dashboard → "Isi data awal".</div>`:''}
 ${!S().open?`<div class="closed noprint">Maaf, toko sedang tutup. ${S().acceptClosed?'Pesanan online tetap dapat dibuat dan akan diproses saat jam operasional.':''}</div>`:''}
 <header class="top"><div class="wrap bar"><a class="brand" href="#/">${logo(38)}<span>${esc(S().name)}<small>${esc(S().slogan)}</small></span></a>
 <nav class="main" aria-label="Menu utama"><a class="hide-m ${active==='home'?'on':''}" href="#/">Beranda</a><a class="hide-m ${active==='produk'?'on':''}" href="#/produk">Produk</a><a class="hide-m" href="#/tracking">Tracking</a><a class="hide-m" href="#/kontak">Kontak</a>
 <a class="cartb" href="#/keranjang" aria-label="Keranjang">🛒${cartCount()?`<b>${cartCount()}</b>`:''}</a>
 ${u?`<a href="#/${isAdm(u)?'admin/dashboard':'akun'}">${esc(u.name.split(' ')[0])}</a>`:`<a href="#/login">Masuk</a>`}</nav></div><div class="band"></div></header>
 <main id="main">${inner}</main>
 <footer><div class="band"></div><div class="wrap in"><div><div class="brand" style="color:#fff">${logo(34)}<span>${esc(S().name)}</span></div><p>Usaha lokal Lombok Timur yang menyediakan ayam segar berkualitas untuk kebutuhan rumah tangga dan usaha kuliner.</p><p><i>${esc(S().slogan)}</i></p></div>
 <div><b>Tautan</b><br><a href="#/">Beranda</a><br><a href="#/produk">Produk</a><br><a href="#/produk?promo=1">Promo</a><br><a href="#/kontak">Cara Pesan &amp; FAQ</a><br><a href="#/kontak">Kontak</a></div>
 <div><b>Kontak</b><br>${S().wa?'WhatsApp '+esc(S().wa):'WhatsApp: [belum diatur]'}<br>${S().address?esc(S().address):'[Alamat toko belum diatur]'}<br>${esc(S().hoursText)}<br><a href="#/admin/login" style="opacity:.6;font-size:.82rem">Admin</a></div></div></footer>
 <button class="fab noprint" onclick="openWA('Halo ${esc(S().name)}, saya ingin memesan ayam.')" aria-label="Chat WhatsApp">💬</button>
 <nav class="mnav noprint" aria-label="Menu bawah"><a class="${active==='home'?'on':''}" href="#/"><span>🏠</span>Home</a><a class="${active==='produk'?'on':''}" href="#/produk"><span>🍗</span>Produk</a><a class="${active==='pesanan'?'on':''}" href="#/akun/pesanan"><span>📋</span>Pesanan</a><a class="${active==='cart'?'on':''}" href="#/keranjang"><span>🛒</span>Keranjang${cartCount()?' ('+cartCount()+')':''}</a><a class="${active==='akun'?'on':''}" href="#/akun"><span>👤</span>Akun</a></nav>`;
}
function out(html,active,title){document.getElementById('app').innerHTML=shell(html,active);document.title=(title?title+' — ':'')+S().name+(title?'':' — Ayam Potong Segar Lombok Timur');window.scrollTo(0,0)}

/* ============ KATALOG ============ */
function pcard(p){const u=me();const up=priceFor(p,1,u);const st_=stockSt(p.stock);const base=baseTier(p,1);
 return `<article class="card"><div style="position:relative"><a href="#/produk/${p.slug}" style="text-decoration:none"><div class="pimg pat" style="overflow:hidden">${p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover">`:`<span aria-hidden="true">${p.emoji}</span>`}</div></a>${heart(p.id)}</div><div class="pad"><h3 style="margin-bottom:4px"><a href="#/produk/${p.slug}" style="color:var(--ink);text-decoration:none">${esc(p.name)}</a></h3>
 <div>${up<base?`<span class="old">${rp(base)}</span>`:''}<span class="price">${rp(up)}</span><small>/${unitLbl(p.unit)}</small></div>
 <div style="margin:6px 0 10px"><span class="tag ${st_[1]}">${st_[0]}</span> ${promoOn(p)?'<span class="tag promo">PROMO</span>':''}</div>
 <button class="btn sm" ${p.stock<=0?'disabled':''} onclick="addCart('${p.id}')">+ Keranjang</button></div></article>`}
function addCart(id,q){const p=prod(id);q=q||step(p);if(p.stock<q){toast('Stok tidak mencukupi.');return}
 const c=cart.find(x=>x.id===id);const nq=Math.round(((c?c.qty:0)+q)*10)/10;if(nq>p.stock){toast('Stok tidak mencukupi.');return}
 if(c){c.qty=nq;c.seen=priceFor(p,nq,me())}else cart.push({id,qty:q,seen:priceFor(p,q,me())});saveCart();toast('Ditambahkan ke keranjang: '+p.name);refreshBadge()}
function refreshBadge(){const a=document.querySelector('a.cartb');if(a)a.innerHTML='🛒'+(cartCount()?`<b>${cartCount()}</b>`:'')}

function pageHome(){
 const names=['Ayam Potong Utuh','Dada Ayam','Paha Atas','Sayap','Ceker'];
 const pb=names.map(n=>db.products.find(p=>p.name===n&&p.active&&!p.deleted)).filter(Boolean);const last=pb.length?Math.max(...pb.map(p=>p.updated||0)):NOW();
 const p1=live().find(p=>p.name==='Ayam Potong Utuh')||live()[0];
 const nm=esc(S().name);
 out(`${bannerHtml()}<section class="hero pat"><div class="wrap in"><div><h1>AYAM SEGAR LANGSUNG DIANTAR KE RUMAH</h1><p class="sub">Pesan ayam potong segar dari usaha lokal Lombok Timur. Pilih produk, tentukan jumlah, bayar dengan mudah, dan kami siapkan pesanan Anda.</p>
 <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="#/produk">BELANJA SEKARANG</a><button class="btn leaf" onclick="openWA('Halo ${nm}, saya ingin memesan ayam.')">PESAN VIA WHATSAPP</button></div>
 <ul class="badges"><li>✓ Segar Setiap Hari</li><li>✓ Diproses Higienis</li><li>✓ Harga Transparan</li><li>✓ Melayani Lombok Timur</li></ul></div>
 <div class="board" id="harga"><h3>HARGA AYAM HARI INI</h3>${pb.length?pb.map(p=>`<div class="row"><span>${esc(p.name)}</span><b>${rp(baseTier(p,1))}/${unitLbl(p.unit)}</b></div>`).join(''):'<p>Harga belum tersedia.</p>'}<p style="margin:10px 0 0;font-size:.85rem">Update terakhir: ${fmtDay(last)}<br>🟢 Harga aktif</p></div></div><div class="band"></div></section>
 ${p1&&p1.tiers&&p1.tiers.length?`<section class="s"><div class="wrap"><h2>Harga makin murah kalau beli banyak</h2><div class="tw card"><table><tr><th>Jumlah beli</th><th>Harga ${esc(p1.name)}</th></tr><tr><td>1–${p1.tiers[0].min-1} kg</td><td>${rp(p1.price)}/kg</td></tr>${p1.tiers.map((t,i)=>`<tr><td>${t.min}${p1.tiers[i+1]?'–'+(p1.tiers[i+1].min-1):'+'} kg</td><td>${rp(t.price)}/kg</td></tr>`).join('')}</table></div></div></section>`:''}
 <section class="s alt-bg"><div class="wrap"><h2>Pilih kategori</h2><div class="grid">${CATS.map(c=>`<a class="card pad" style="text-decoration:none;color:var(--ink);text-align:center" href="#/produk?cat=${c[0]}"><div style="font-size:2.2rem">${c[2]}</div><b>${esc(c[1])}</b></a>`).join('')}</div></div></section>
 <section class="s"><div class="wrap"><h2>Produk pilihan</h2>${live().length?`<div class="grid">${live().slice(0,8).map(pcard).join('')}</div>`:'<div class="msg">Produk belum tersedia.</div>'}<p><a class="btn alt" href="#/produk">Lihat semua produk</a></p></div></section>
 <section class="s alt-bg"><div class="wrap"><h2>Cara pesan</h2><div class="steps"><div><b>Pilih produk</b><br>Tentukan jumlah, tambahkan ke keranjang.</div><div><b>Checkout</b><br>Isi alamat dan pilih kecamatan untuk ongkir.</div><div><b>Bayar</b><br>QRIS, transfer bank, atau COD saat diantar.</div><div><b>Pantau pesanan</b><br>Cek status di halaman Tracking.</div></div></div></section>
 ${homeExtra()}<section class="s"><div class="wrap"><div class="card pad" style="max-width:560px"><h2>Pesan cepat via WhatsApp</h2><label for="q_n">Nama</label><input id="q_n"><label for="q_w">Nomor WhatsApp</label><input id="q_w" inputmode="tel"><label for="q_p">Produk</label><select id="q_p">${live().map(p=>`<option>${esc(p.name)}</option>`).join('')}</select><label for="q_j">Jumlah</label><input id="q_j" placeholder="contoh: 2 kg"><label for="q_a">Alamat</label><textarea id="q_a" rows="2"></textarea><p><button class="btn leaf" onclick="quickWA()">KIRIM PESAN WHATSAPP</button></p></div></div></section>`,'home')}
function quickWA(){if(!V('q_n')||!V('q_j')||!V('q_a')){toast('Lengkapi nama, jumlah, dan alamat.');return}
 openWA(`Halo ${S().name}, saya ingin memesan:\nNama: ${V('q_n')}\nWhatsApp: ${V('q_w')}\nProduk: ${V('q_p')}\nJumlah: ${V('q_j')}\nAlamat: ${V('q_a')}`)}

function pageProducts(q){
 const prm=new URLSearchParams(q||'');const cat=prm.get('cat'),s=(prm.get('q')||'').toLowerCase(),promo=prm.get('promo');
 let l=live().filter(p=>(!cat||p.cat===cat)&&(!s||p.name.toLowerCase().includes(s))&&(!promo||promoOn(p)));
 out(`<div class="wrap" style="padding-top:24px"><h1 style="font-size:2rem">${promo?'Promo':'Produk Ayam Potong Lombok Timur'}</h1>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><a class="btn sm ${!cat?'':'alt'}" href="#/produk">Semua</a>${CATS.map(c=>`<a class="btn sm ${cat===c[0]?'':'alt'}" href="#/produk?cat=${c[0]}">${c[2]} ${esc(c[1])}</a>`).join('')}</div>
 <input id="srch" placeholder="Cari produk…" value="${esc(s)}" onkeydown="if(event.key==='Enter')location.hash='#/produk?q='+encodeURIComponent(this.value)" style="max-width:340px;margin-bottom:14px" aria-label="Cari produk">
 ${l.length?`<div class="grid">${l.map(pcard).join('')}</div>`:'<div class="msg">Produk sedang tidak tersedia.</div>'}</div>`,'produk','Produk')}

function pageProduct(slug){
 const p=db.products.find(x=>x.slug===slug&&!x.deleted&&x.active);if(!p){out('<div class="wrap" style="padding:24px 16px"><div class="msg">Produk sedang tidak tersedia.</div></div>','produk');return}
 const rv=db.reviews.filter(r=>r.pid===p.id&&!r.hidden);const avg=rv.length?(rv.reduce((a,r)=>a+r.star,0)/rv.length).toFixed(1):null;const st_=stockSt(p.stock);const tiers=p.tiers||[];
 out(`<div class="wrap" style="padding:24px 16px"><a href="#/produk">← Semua produk</a><div class="cols" style="margin-top:14px"><div class="card pimg pat" style="height:240px;font-size:6rem;overflow:hidden">${p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover">`:p.emoji}</div>
 <div><h1 style="font-size:2rem">${esc(p.name)}</h1><p>${esc(p.desc)}</p>${p.p500||p.pEkor?`<p>${p.p500?'Eceran 500 g: <b>'+rp(p.p500)+'</b> ':''}${p.pEkor?'Per ekor: <b>'+rp(p.pEkor)+'</b>':''}</p>`:''}<div id="pp" class="price" style="font-size:1.6rem"></div><p><span class="tag ${st_[1]}">${st_[0]}</span> <small>Stok ${fmtN(p.stock)} ${unitLbl(p.unit)}</small> ${promoOn(p)?'<span class="tag promo">PROMO</span>':''}</p>
 ${tiers.length?`<div class="tw"><table><tr><th>Jumlah</th><th>Harga/${unitLbl(p.unit)}</th></tr><tr><td>1+</td><td>${rp(p.price)}</td></tr>${tiers.map(t=>`<tr><td>${t.min}+</td><td>${rp(t.price)}</td></tr>`).join('')}</table></div>`:''}
 <label for="dq">Jumlah (${unitLbl(p.unit)})</label><input id="dq" type="number" min="${step(p)}" step="${step(p)}" value="${step(p)}" oninput="updDetail('${p.id}')" style="max-width:160px">
 <p><button class="btn" ${p.stock<=0?'disabled':''} onclick="addCart('${p.id}',parseFloat(V('dq'))||${step(p)})">TAMBAH KE KERANJANG</button> <button class="btn alt" onclick="togWish('${p.id}')">♡ Favorit</button></p></div></div>
 <h2 style="margin-top:28px">Ulasan ${avg?`⭐ ${avg} (${rv.length})`:''}</h2>${rv.length?rv.map(r=>`<div class="card pad" style="margin-bottom:8px">${'⭐'.repeat(r.star)} <b>${esc(r.name)}</b> ${r.verified?'<span class="tag ok">Verified Purchase</span>':''}<br>${esc(r.text)}</div>`).join(''):'<p>Belum ada ulasan.</p>'}</div>`,'produk',p.name);updDetail(p.id)}
function updDetail(id){const p=prod(id),q=parseFloat(V('dq'))||step(p),u=me();const e=$('#pp');if(e)e.innerHTML=`${rp(priceFor(p,q,u))}<small>/${unitLbl(p.unit)}</small> <small style="color:var(--mut)">· Total ${rp(priceFor(p,q,u)*q)}</small>`}

/* ============ KERANJANG & CHECKOUT ============ */
function pageCart(){
 const u=me();cart=cart.filter(c=>prod(c.id)&&!prod(c.id).deleted);saveCart();
 const sub=cart.reduce((a,c)=>a+priceFor(prod(c.id),c.qty,u)*c.qty,0);
 out(`<div class="wrap" style="padding:24px 16px"><h1 style="font-size:2rem">Keranjang</h1>${!cart.length?'<div class="msg">Belum ada ayam di keranjang.</div><a class="btn" href="#/produk">Lihat produk</a>':
 `<div class="tw card"><table><tr><th>Produk</th><th>Harga</th><th>Jumlah</th><th>Total</th><th></th></tr>${cart.map(c=>{const p=prod(c.id),up=priceFor(p,c.qty,u);return`<tr><td>${p.emoji} ${esc(p.name)}</td><td>${rp(up)}/${unitLbl(p.unit)}</td><td><button class="btn sm alt" onclick="chQty('${c.id}',-1)" aria-label="Kurangi">−</button> ${c.qty} <button class="btn sm alt" onclick="chQty('${c.id}',1)" aria-label="Tambah">+</button></td><td>${rp(up*c.qty)}</td><td><button class="btn sm alt" onclick="rmCart('${c.id}')">Hapus</button></td></tr>`}).join('')}</table></div>
 <p class="price" style="text-align:right">Subtotal ${rp(sub)}</p><p style="text-align:right"><button class="btn leaf" onclick="openWA(cartMsg())">Pesan via WhatsApp</button> <a class="btn" href="#/checkout">CHECKOUT</a></p>`}</div>`,'cart','Keranjang')}
function cartMsg(){const u=me();return'Halo '+S().name+', saya ingin memesan:\n'+cart.map(c=>{const p=prod(c.id);return`- ${p.name} ${c.qty} ${unitLbl(p.unit)} (${rp(priceFor(p,c.qty,u)*c.qty)})`}).join('\n')+'\nTotal produk: '+rp(cart.reduce((a,c)=>a+priceFor(prod(c.id),c.qty,u)*c.qty,0))}
function chQty(id,d){const c=cart.find(x=>x.id===id),p=prod(id);const n=Math.round((c.qty+d*step(p))*10)/10;if(n<=0)return rmCart(id);if(n>p.stock){toast('Stok tidak mencukupi.');return}c.qty=n;saveCart();pageCart()}
function rmCart(id){cart=cart.filter(c=>c.id!==id);saveCart();pageCart()}

function calc(code,zone){
 const u=me();const lines=cart.map(c=>{const p=prod(c.id);const up=priceFor(p,c.qty,u);return{p,qty:c.qty,up,lt:Math.round(up*c.qty),seen:c.seen}});
 const sub=lines.reduce((a,l)=>a+l.lt,0),kg=lines.reduce((a,l)=>a+(l.p.unit==='kg'?l.qty:0),0);
 let disc=0,vfree=false,verr='',v=null;
 if(code){v=db.vouchers.find(x=>x.code===code.trim().toUpperCase()&&x.active);if(!v||sub<v.min)verr='Voucher tidak berlaku.';else if(v.type==='persen')disc=Math.round(sub*v.value/100);else if(v.type==='nominal')disc=Math.min(v.value,sub);else vfree=true}
 const z=db.zones.find(x=>x.k===zone&&x.active);let ship=z?z.fee:0;
 const free=!!z&&((S().freeMinTotal>0&&sub>=S().freeMinTotal)||(S().freeMinKg>0&&kg>=S().freeMinKg)||vfree);if(free)ship=0;
 return{lines,sub,disc,ship,free,total:sub-disc+ship,verr,z,v}}
function pageCheckout(){
 const u=me();if(!u){toast('Silakan masuk atau daftar untuk checkout.');location.hash='#/login?next=checkout';return}
 if(!cart.length){location.hash='#/keranjang';return}
 if(!S().open&&!S().acceptClosed){out('<div class="wrap" style="padding:24px 16px"><div class="msg err">Maaf, toko sedang tutup.</div></div>','cart');return}
 const ch=cart.map(c=>{const p=prod(c.id),now=priceFor(p,c.qty,u);return now!==c.seen?`⚠️ Harga ${esc(p.name)} telah berubah dari ${rp(c.seen)} menjadi ${rp(now)}/${unitLbl(p.unit)}.`:''}).filter(Boolean);
 out(`<div class="wrap" style="padding:24px 16px"><h1 style="font-size:2rem">Checkout</h1>
 ${ch.length?`<div class="msg err" id="chg">${ch.join('<br>')}<br><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="okp" style="width:auto;min-height:0"> Saya setuju dengan harga terbaru.</label></div>`:''}
 <div class="cols"><div class="card pad"><h3>Data pengiriman</h3>${savedAddrSel(u)}<label for="c_n">Nama lengkap</label><input id="c_n" value="${esc(u.name)}"><label for="c_w">WhatsApp</label><input id="c_w" inputmode="tel" value="${esc(u.phone)}"><label for="c_k">Kecamatan</label><select id="c_k" onchange="updCo()"><option value="">Pilih kecamatan…</option>${db.zones.filter(z=>z.active).map(z=>`<option>${esc(z.k)}</option>`).join('')}</select>
 <label for="c_d">Desa</label><input id="c_d"><label for="c_a">Alamat</label><textarea id="c_a" rows="2"></textarea><label for="c_p">Patokan rumah</label><input id="c_p" placeholder="Rumah warna hijau dekat masjid."><label for="c_c">Catatan</label><input id="c_c">
 <label for="c_s">Waktu pengantaran</label><select id="c_s"><option>Secepatnya</option>${S().slots.map(s=>`<option>${esc(s)}</option>`).join('')}</select></div>
 <div class="card pad"><h3>Pembayaran</h3><div id="payopts"></div><label for="c_v">Kode voucher</label><div style="display:flex;gap:8px"><input id="c_v" oninput="updCo()" placeholder="mis. LOTIMHEMAT"></div><div id="cosum" style="margin-top:14px"></div><p><button class="btn" onclick="placeOrder()">BUAT PESANAN</button></p><div id="coerr"></div></div></div></div>`,'cart','Checkout');updCo()}
function updCo(){
 const k=V('c_k'),z=db.zones.find(x=>x.k===k&&x.active);const sel=(document.querySelector('input[name=pay]:checked')||{}).value;
 const opts=[['qris','QRIS'],['transfer','Transfer Bank'],...(S().cod&&(!z||z.cod)?[['cod','COD / Bayar Saat Pesanan Diantar']]:[])];
 $('#payopts').innerHTML=opts.map((o,i)=>`<label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="radio" name="pay" value="${o[0]}" style="width:auto;min-height:0" ${(sel?sel===o[0]:i===0)?'checked':''}> ${o[1]}</label>`).join('');
 const r=calc(V('c_v'),k);
 $('#cosum').innerHTML=`<table>${r.lines.map(l=>`<tr><td>${esc(l.p.name)} × ${l.qty}</td><td style="text-align:right">${rp(l.lt)}</td></tr>`).join('')}<tr><td>Subtotal</td><td style="text-align:right">${rp(r.sub)}</td></tr>${r.disc?`<tr><td>Diskon voucher</td><td style="text-align:right">−${rp(r.disc)}</td></tr>`:''}<tr><td>Ongkir ${k?(r.free?'(gratis)':''):'(pilih kecamatan)'}</td><td style="text-align:right">${rp(r.ship)}</td></tr><tr><td><b>Total</b></td><td style="text-align:right" class="price">${rp(r.total)}</td></tr></table>${r.verr?`<div class="msg err">${r.verr}</div>`:''}`}
let PLACING=false;
async function placeOrder(){
 if(PLACING)return;
 const u=me();if(!u)return;const k=V('c_k'),r=calc(V('c_v'),k);const E=m=>{$('#coerr').innerHTML=`<div class="msg err">${m}</div>`};
 if(document.getElementById('chg')&&!$('#okp').checked)return E('Harga produk telah berubah. Centang persetujuan harga terbaru.');
 if(!V('c_n').trim()||!V('c_w').trim()||!V('c_a').trim())return E('Lengkapi nama, WhatsApp, dan alamat.');
 if(!/^[0-9+\s-]{9,16}$/.test(V('c_w').trim()))return E('Nomor WhatsApp tidak valid.');
 if(!r.z)return E('Wilayah belum tersedia.');
 if(V('c_v')&&r.verr)return E(r.verr);
 const pay=(document.querySelector('input[name=pay]:checked')||{}).value;if(!pay)return E('Pilih metode pembayaran.');
 if(r.sub<S().minTotal)return E('Minimal pembelian adalah '+rp(S().minTotal)+'.');
 for(const l of r.lines){if(l.p.stock<l.qty)return E('Stok tidak mencukupi: '+esc(l.p.name)+'.')}
 PLACING=true;
 const dt=new Date(),day=''+dt.getFullYear()+String(dt.getMonth()+1).padStart(2,'0')+String(dt.getDate()).padStart(2,'0');
 const base={id:'o'+uid()+uid(),uid:u.id,name:V('c_n').trim(),phone:V('c_w').trim(),addr:V('c_a').trim(),kec:k,desa:V('c_d').trim(),patokan:V('c_p').trim(),note:V('c_c').trim(),slot:V('c_s'),
  items:r.lines.map(l=>({pid:l.p.id,name:l.p.name,unit:l.p.unit,qty:l.qty,up:l.up,lt:l.lt})),sub:r.sub,disc:r.disc,ship:r.ship,total:r.total,voucher:r.v?r.v.code:'',method:pay,pay:pay==='cod'?'cod':'belum_bayar',proof:'',status:'dibuat',deducted:false,created:NOW(),log:[{t:NOW(),s:'dibuat'}]};
 try{
  const cref=fs.collection('counters').doc(day);
  const o=await fs.runTransaction(async tx=>{
   const s=await tx.get(cref);const n=(s.exists?s.data().n:0)+1;const no='#ASL-'+day+'-'+String(n).padStart(4,'0');
   tx.set(cref,{n});const ord=Object.assign({no},base);
   tx.set(fs.collection('orders').doc(ord.id),ord);
   tx.set(fs.collection('tracking').doc(no.slice(1)),{no,status:'dibuat',created:base.created});
   return ord});
  notif('admin','Pesanan '+o.no+' berhasil dibuat.');notif(u.id,'Pesanan '+o.no+' berhasil dibuat.');
  if(!db.orders.some(x=>x.id===o.id))db.orders.unshift(o);
  cart=[];saveCart();toast('Pesanan '+o.no+' berhasil dibuat.');location.hash='#/akun/pesanan/'+o.id
 }catch(e){fail(e);E('Gagal membuat pesanan. Coba lagi.')}finally{PLACING=false}}

/* ============ PESANAN PELANGGAN ============ */
const STEPS=[['dibuat','Pesanan dibuat'],['dikonfirmasi','Pembayaran dikonfirmasi'],['diproses','Sedang diproses'],['dikemas','Dikemas'],['dikirim','Sedang dikirim'],['selesai','Selesai']];
const stIdx=s=>STEPS.findIndex(x=>x[0]===s);
const payLbl={belum_bayar:'Belum dibayar',menunggu_verifikasi:'Menunggu verifikasi',diverifikasi:'Diverifikasi',ditolak:'Ditolak',cod:'COD (bayar saat diantar)'};
function timeline(o){if(o.status==='dibatalkan')return'<div class="msg err">Pesanan dibatalkan.</div>';const i=stIdx(o.status);return`<ul class="tl">${STEPS.map((s,j)=>`<li class="${j<=i?'d':''}">${s[1]}</li>`).join('')}</ul>`}
function pageOrders(){const u=me();const l=db.orders.filter(o=>o.uid===u.id);
 acct(`<h2>Pesanan saya</h2>${l.length?l.map(o=>`<a class="card pad" style="display:block;margin-bottom:10px;text-decoration:none;color:var(--ink)" href="#/akun/pesanan/${o.id}"><b>${o.no}</b> <span class="tag">${STEPS[stIdx(o.status)]?STEPS[stIdx(o.status)][1]:'Dibatalkan'}</span><br>${fmtD(o.created)} · ${rp(o.total)}</a>`).join(''):'<div class="msg">Belum ada pesanan.</div>'}`,'pesanan')}
function pageOrder(id){const u=me();const o=db.orders.find(x=>x.id===id&&(x.uid===u.id));if(!o){acct('<div class="msg err">Pesanan tidak ditemukan.</div>','pesanan');return}
 const need=o.method!=='cod'&&['belum_bayar','ditolak'].includes(o.pay)&&o.status!=='dibatalkan';
 acct(`<h2>${o.no}</h2>${timeline(o)}
 <div class="card pad"><b>Pembayaran:</b> ${{qris:'QRIS',transfer:'Transfer Bank',cod:'COD'}[o.method]} — <span class="tag ${o.pay==='diverifikasi'?'ok':o.pay==='ditolak'?'b':'w'}">${payLbl[o.pay]}</span><br><b>Total:</b> <span class="price">${rp(o.total)}</span>
 ${need?payBox(o):''}${o.pay==='menunggu_verifikasi'?'<p class="msg">Pembayaran belum diverifikasi. Admin akan memeriksa bukti Anda.</p>':''}</div>
 <div class="tw card" style="margin-top:12px"><table><tr><th>Produk</th><th>Jumlah</th><th>Harga</th><th>Total</th></tr>${o.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.qty} ${unitLbl(i.unit)}</td><td>${rp(i.up)}</td><td>${rp(i.lt)}</td></tr>`).join('')}<tr><td colspan="3">Subtotal</td><td>${rp(o.sub)}</td></tr><tr><td colspan="3">Diskon</td><td>−${rp(o.disc)}</td></tr><tr><td colspan="3">Ongkir</td><td>${rp(o.ship)}</td></tr><tr><td colspan="3"><b>Total</b></td><td><b>${rp(o.total)}</b></td></tr></table></div>
 <p>Dikirim ke: ${esc(o.addr)}, ${esc(o.desa)} ${esc(o.kec)} · ${esc(o.slot)}</p>
 <p><a class="btn alt" href="#/invoice/${o.id}">Lihat invoice</a> <button class="btn leaf" onclick="openWA('Halo, saya menanyakan pesanan ${o.no}')">Tanya via WhatsApp</button></p>
 ${o.status==='selesai'?`<h3>Beri ulasan</h3>${o.items.map(i=>`<div class="card pad" style="margin-bottom:8px"><b>${esc(i.name)}</b>${db.reviews.some(r=>r.oid===o.id&&r.pid===i.pid)?'<br>Terima kasih atas ulasan Anda.':`<select id="rs_${i.pid}" style="max-width:140px;margin:6px 0">${[5,4,3,2,1].map(n=>`<option value="${n}">${'⭐'.repeat(n)}</option>`).join('')}</select><input id="rt_${i.pid}" placeholder="Komentar"><br><br><button class="btn sm" onclick="addReview('${o.id}','${i.pid}')">Kirim ulasan</button>`}</div>`).join('')}`:''}`,'pesanan')}
function payBox(o){const q=db.qris,b=db.banks;
 return`<div style="margin-top:12px">${o.method==='qris'?`<h3>Bayar dengan QRIS</h3>${q.img?`<img src="${esc(q.img)}" alt="QRIS" style="max-width:260px;display:block">`:'<div class="msg">QRIS belum diunggah admin. Hubungi admin via WhatsApp.</div>'}${q.merchant?`<p>${esc(q.merchant)} ${q.mid?'· ID '+esc(q.mid):''}</p>`:''}`:`<h3>Transfer ke rekening</h3>${b.length?b.map(x=>`<p><b>${esc(x.bank)}</b> ${esc(x.no)}<br>a.n. ${esc(x.holder)} ${x.demo?'<span class="tag w">DEMO</span>':''}</p>`).join(''):'<div class="msg">Rekening belum diatur admin. Hubungi admin via WhatsApp.</div>'}`}
 <label for="proof">Unggah bukti pembayaran</label><input id="proof" type="file" accept="image/*"><p><button class="btn" onclick="sendProof('${o.id}')">SAYA SUDAH BAYAR</button></p></div>`}
async function sendProof(id){const f=$('#proof').files[0];if(!f){toast('Pilih foto bukti pembayaran.');return}const o=db.orders.find(x=>x.id===id);if(!o)return;
 try{toast('Mengunggah bukti…');const url=await upImg('proofs/'+me().id+'/'+id+'.jpg',f,1000);await fs.collection('orders').doc(id).update({proof:url,pay:'menunggu_verifikasi'});o.proof=url;o.pay='menunggu_verifikasi';notif('admin','Bukti pembayaran '+o.no+' menunggu verifikasi.');toast('Bukti terkirim. Menunggu verifikasi.')}catch(e){return fail(e)}
 pageOrder(id)}
async function addReview(oid,pid){const u=me(),o=db.orders.find(x=>x.id===oid&&x.uid===u.id&&x.status==='selesai');if(!o)return;
 const r={id:oid+'_'+pid,pid,oid,uid:u.id,name:u.name.split(' ')[0],star:+V('rs_'+pid),text:V('rt_'+pid).slice(0,300),verified:true,hidden:false,created:NOW()};
 try{await fs.collection('reviews').doc(r.id).set(r)}catch(e){return fail(e)}
 if(!db.reviews.some(x=>x.id===r.id))db.reviews.unshift(r);toast('Ulasan terkirim.');pageOrder(oid)}

function pageTracking(q){
 out(`<div class="wrap" style="padding:24px 16px;max-width:560px"><h1 style="font-size:2rem">Tracking pesanan</h1><label for="tn">Nomor pesanan</label><input id="tn" placeholder="#ASL-20261006-0001" value="${esc(q||'')}"><p><button class="btn" onclick="doTrack()">CEK STATUS</button></p><div id="tres"></div></div>`,'','Tracking');if(q)doTrack()}
async function doTrack(){const n=V('tn').trim().toUpperCase().replace(/^#/,'');const box=$('#tres');
 if(!/^ASL-\d{8}-\d{4}$/.test(n)){box.innerHTML='<div class="msg err">Format nomor pesanan tidak valid. Contoh: #ASL-20261006-0001</div>';return}
 try{const s=await fs.collection('tracking').doc(n).get();const d=s.exists?s.data():null;box.innerHTML=d?`<div class="card pad"><b>${esc(d.no)}</b><br>${fmtD(d.created)}${timeline(d)}</div>`:'<div class="msg err">Pesanan tidak ditemukan.</div>'}
 catch(e){box.innerHTML='<div class="msg err">Gagal memeriksa pesanan. Coba lagi.</div>'}}

function pageInvoice(id){const u=me();const o=db.orders.find(x=>x.id===id&&(u&&(x.uid===u.id||isAdm(u))));if(!o){out('<div class="wrap" style="padding:24px 16px"><div class="msg err">Invoice tidak ditemukan.</div></div>');return}
 out(`<div class="wrap" style="max-width:720px;padding:24px 16px"><p class="noprint"><button class="btn" onclick="try{window.print()}catch(e){toast('Cetak tidak tersedia.')}">Cetak / Simpan PDF</button> <a class="btn alt" href="javascript:history.back()">Kembali</a></p>
 <div class="card pad"><div class="brand">${logo(40)}<span>${esc(S().name)}</span></div><h2 style="margin-top:12px">INVOICE ${o.no}</h2><p>Tanggal: ${fmtD(o.created)}<br>Pelanggan: ${esc(o.name)} · ${esc(o.phone)}<br>Alamat: ${esc(o.addr)}, ${esc(o.desa)} ${esc(o.kec)}</p>
 <div class="tw"><table><tr><th>Produk</th><th>Jumlah</th><th>Harga</th><th>Total</th></tr>${o.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${i.qty} ${unitLbl(i.unit)}</td><td>${rp(i.up)}</td><td>${rp(i.lt)}</td></tr>`).join('')}<tr><td colspan="3">Subtotal</td><td>${rp(o.sub)}</td></tr><tr><td colspan="3">Diskon</td><td>−${rp(o.disc)}</td></tr><tr><td colspan="3">Ongkir</td><td>${rp(o.ship)}</td></tr><tr><td colspan="3"><b>Total</b></td><td><b>${rp(o.total)}</b></td></tr></table></div>
 <p>Metode pembayaran: ${{qris:'QRIS',transfer:'Transfer Bank',cod:'COD'}[o.method]}<br>Status pembayaran: ${payLbl[o.pay]}<br>Status pesanan: ${(STEPS[stIdx(o.status)]||['','Dibatalkan'])[1]}</p><p style="text-align:center"><i>${esc(S().slogan)}</i></p></div></div>`,'')}

/* ============ AKUN ============ */
function acct(inner,active){
 out(`<div class="wrap" style="padding:24px 16px"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><a class="btn sm ${active==='akun'?'':'alt'}" href="#/akun">Profil</a><a class="btn sm ${active==='pesanan'?'':'alt'}" href="#/akun/pesanan">Pesanan</a><a class="btn sm ${active==='alamat'?'':'alt'}" href="#/akun/alamat">Alamat</a><a class="btn sm ${active==='wish'?'':'alt'}" href="#/akun/wishlist">Favorit</a><a class="btn sm ${active==='set'?'':'alt'}" href="#/akun/pengaturan">Pengaturan</a><button class="btn sm alt" onclick="logout()">Logout</button></div>${inner}</div>`,active==='pesanan'?'pesanan':'akun','Akun')}
function pageAccount(){const u=me();const ns=db.notifs.slice(0,5);
 acct(`<h2>Halo, ${esc(u.name)}</h2><div class="card pad" style="max-width:480px">${u.avatar?`<img src="${esc(u.avatar)}" alt="Foto profil" width="72" height="72" style="border-radius:50%;object-fit:cover">`:'<div style="font-size:3rem" aria-hidden="true">👤</div>'}<label for="a_f">Foto profil</label><input id="a_f" type="file" accept="image/*" onchange="upAvatar(this)"><p><b>Email:</b> ${esc(u.email)}<br><b>Member:</b> ${String(u.level||'regular').toUpperCase()} ${u.wholesale?'· Grosir':''}<br><b>Bergabung:</b> ${fmtDay(u.created)}</p>
 <label for="a_n">Nama</label><input id="a_n" value="${esc(u.name)}"><label for="a_w">Nomor WhatsApp</label><input id="a_w" value="${esc(u.phone)}"><p><button class="btn" onclick="saveProfile()">SIMPAN PROFIL</button></p>${u.wholesale?'<p><span class="tag ok">Akun grosir aktif</span></p>':u.wsReq?'<p><span class="tag w">Pengajuan grosir menunggu persetujuan admin</span></p>':'<p><button class="btn alt sm" onclick="reqWs()">Ajukan akun grosir</button></p>'}</div>
 <h3 style="margin-top:20px">Notifikasi</h3>${ns.length?ns.map(n=>`<div class="msg">${esc(n.text)}<br><small>${fmtD(n.t)}</small></div>`).join(''):'<p>Belum ada notifikasi.</p>'}`,'akun')}
async function saveProfile(){const u=me();if(!V('a_n').trim()){toast('Nama wajib diisi.');return}
 try{await fs.collection('users').doc(u.id).update({name:V('a_n').trim(),phone:V('a_w').trim()});toast('Profil diperbarui.')}catch(e){fail(e)}}
function pageSettings(){acct(`<h2>Pengaturan akun</h2><div class="card pad" style="max-width:420px"><h3>Ubah password</h3><label for="p0">Password lama</label><input id="p0" type="password" autocomplete="current-password"><label for="p1">Password baru</label><input id="p1" type="password" autocomplete="new-password"><label for="p2">Konfirmasi password baru</label><input id="p2" type="password" autocomplete="new-password"><div id="perr"></div><p><button class="btn" onclick="chPw()">UBAH PASSWORD</button></p></div>`,'set')}
async function chPw(){const E=(m,c)=>$('#perr').innerHTML=`<div class="msg ${c||'err'}">${m}</div>`;
 if(V('p1').length<8)return E('Password minimal 8 karakter.');if(V('p1')!==V('p2'))return E('Konfirmasi password tidak sama.');
 try{await FBU.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(FBU.email,V('p0')));await FBU.updatePassword(V('p1'));E('Password berhasil diperbarui.','ok')}
 catch(x){E(x.code==='auth/wrong-password'||x.code==='auth/invalid-credential'?'Password lama tidak sesuai.':AE(x))}}

function authForm(title,body){out(`<div class="card form"><div style="text-align:center">${logo(48)}</div><h1 style="font-size:1.6rem;text-align:center;margin-top:8px">${title}</h1>${body}</div>`,'akun',title)}
function pageLogin(q){const nx=new URLSearchParams(q||'').get('next')||'';
 authForm('Masuk',`<div id="lerr"></div><label for="l_e">Email</label><input id="l_e" type="email" autocomplete="email"><label for="l_p">Password</label><input id="l_p" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')custLogin('${esc(nx)}')"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="l_r" style="width:auto;min-height:0"> Ingat saya</label><p><button class="btn" style="width:100%" onclick="custLogin('${esc(nx)}')">MASUK</button></p><p style="text-align:center"><a href="#/forgot-password">Lupa Password?</a> · <a href="#/register">Daftar Sekarang</a></p>`)}
async function custLogin(nx){const e=await doLogin(V('l_e'),V('l_p'),false,$('#l_r').checked);if(e){$('#lerr').innerHTML=`<div class="msg err">${e}</div>`;return}const u=await waitMe();location.hash=isAdm(u)?'#/admin/dashboard':'#/'+(nx||'akun')}
function pageRegister(){authForm('Buat Akun',`<div id="rerr"></div><label for="r_n">Nama lengkap</label><input id="r_n"><label for="r_w">Nomor WhatsApp</label><input id="r_w" inputmode="tel"><label for="r_e">Email</label><input id="r_e" type="email"><label for="r_p">Password</label><input id="r_p" type="password" autocomplete="new-password"><label for="r_p2">Konfirmasi password</label><input id="r_p2" type="password" autocomplete="new-password"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="r_t" style="width:auto;min-height:0"> Saya menyetujui syarat dan ketentuan</label><p><button class="btn" style="width:100%" onclick="doReg()">BUAT AKUN</button></p><p style="text-align:center"><a href="#/login">Sudah punya akun? Masuk</a></p>`)}
async function doReg(){const E=m=>$('#rerr').innerHTML=`<div class="msg err">${m}</div>`;const e=V('r_e').trim().toLowerCase();
 if(!V('r_n').trim()||!/^\S+@\S+\.\S+$/.test(e))return E('Nama dan email yang valid wajib diisi.');if(!/^[0-9+\s-]{9,16}$/.test(V('r_w').trim()))return E('Nomor WhatsApp tidak valid.');if(V('r_p').length<8)return E('Password minimal 8 karakter.');if(V('r_p')!==V('r_p2'))return E('Konfirmasi password tidak sama.');if(!$('#r_t').checked)return E('Setujui syarat dan ketentuan.');
 try{
  const c=await auth.createUserWithEmailAndPassword(e,V('r_p'));
  await fs.collection('users').doc(c.user.uid).set({name:V('r_n').trim(),email:c.user.email,phone:V('r_w').trim(),role:'customer',level:'regular',wholesale:false,active:true,created:NOW(),last:NOW(),wish:[],wsReq:false});
  c.user.sendEmailVerification().catch(()=>{});
  toast('Akun berhasil dibuat. Email verifikasi telah dikirim.');await waitMe();location.hash='#/akun'
 }catch(x){E(AE(x))}}
function pageForgot(admin){authForm('Lupa Password',`<div id="ferr"></div><div class="msg">Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang password.</div><label for="f_e">Email</label><input id="f_e" type="email"><p><button class="btn" style="width:100%" onclick="doForgot(${!!admin})">Kirim Tautan Reset</button></p><p style="text-align:center"><a href="#/${admin?'admin/login':'login'}">Kembali ke halaman masuk</a></p>`)}
async function doForgot(admin){const E=(m,c)=>$('#ferr').innerHTML=`<div class="msg ${c||'err'}">${m}</div>`;const e=V('f_e').trim();
 if(!/^\S+@\S+\.\S+$/.test(e))return E('Masukkan email yang valid.');
 try{await auth.sendPasswordResetEmail(e);E('Jika email terdaftar, tautan untuk mengatur ulang password telah dikirim. Periksa juga folder spam.','ok')}catch(x){E(AE(x))}}

/* ============ KONTAK ============ */
function pageContact(){const s=S();const map=s.maps||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.address||'Lombok Timur');
 out(`<div class="wrap" style="padding:24px 16px;max-width:760px"><h1 style="font-size:2rem">Kontak</h1><div class="card pad"><p><b>WhatsApp</b><br>${s.wa?esc(s.wa):'[Nomor Admin]'}</p><p><b>Alamat</b><br>${s.address?esc(s.address):'[Lokasi Toko — diatur admin]'}</p><p><b>Jam</b><br>${esc(s.hoursText)}</p><p><b>Instagram</b> ${esc(s.ig||'[@username]')} · <b>Facebook</b> ${esc(s.fb||'[username]')} · <b>TikTok</b> ${esc(s.tt||'[username]')}</p><a class="btn alt" href="${esc(safeLink(map))}" target="_blank" rel="noopener">BUKA DI GOOGLE MAPS</a></div>
 <h2 style="margin-top:28px">FAQ</h2>${[['Wilayah mana yang dilayani?','Seluruh Kabupaten Lombok Timur. Ongkir mengikuti kecamatan Anda.'],['Bagaimana cara membayar?','QRIS, transfer bank, atau COD (jika tersedia di kecamatan Anda). Untuk QRIS dan transfer, unggah bukti pembayaran lalu tunggu verifikasi admin.'],['Kapan gratis ongkir?','Belanja minimal '+rp(s.freeMinTotal)+' atau minimal '+s.freeMinKg+' kg.'],['Apakah harga bisa berubah?','Ya, harga mengikuti pasar. Jika harga berubah sebelum checkout, Anda akan diminta menyetujui harga terbaru.']].map(f=>`<details class="card pad" style="margin-bottom:8px"><summary><b>${f[0]}</b></summary><p>${f[1]}</p></details>`).join('')}</div>`,'','Kontak & FAQ')}

/* ============ ADMIN ============ */
const AM=[['dashboard','Dashboard'],['orders','Pesanan'],['products','Produk · Harga · Stok'],['categories','Kategori'],['shipping','Ongkir'],['vouchers','Voucher & Promo'],['payments','Pembayaran'],['banners','Banner'],['reviews','Review'],['reports','Laporan'],['settings','Pengaturan'],['admins','Admin & Pelanggan'],['audit-logs','Audit Log']];
function admShell(inner,key){const u=me();
 document.getElementById('app').innerHTML=`<header class="top"><div class="wrap bar"><a class="brand" href="#/admin/dashboard">${logo(36)}<span>Admin<small>${esc(u.name)} · ${u.role}</small></span></a><nav class="main"><a href="#/">Lihat toko</a><a href="javascript:logout()">Logout</a></nav></div><div class="band"></div></header><div class="adm"><aside class="side">${AM.map(m=>`<a class="${m[0]===key?'on':''}" href="#/admin/${m[0]}">${m[1]}</a>`).join('')}</aside><div class="pgwrap">${inner}</div></div>`;document.title='Admin — '+S().name;window.scrollTo(0,0)}
function pageAdminLogin(){
 authForm('Admin',`<div id="lerr"></div><label for="l_e">Email admin</label><input id="l_e" type="email"><label for="l_p">Password</label><input id="l_p" type="password" onkeydown="if(event.key==='Enter')admLogin()"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="l_r" style="width:auto;min-height:0"> Ingat saya</label><p><button class="btn" style="width:100%" onclick="admLogin()">MASUK SEBAGAI ADMIN</button></p><p style="text-align:center"><a href="#/admin/forgot-password">Lupa Password?</a></p><div class="msg"><small>Belum punya admin? Daftar dulu sebagai pelanggan, lalu ubah field <b>role</b> akun itu menjadi <b>super_admin</b> di Firebase Console → Firestore → users.</small></div>`)}
async function admLogin(){const e=await doLogin(V('l_e'),V('l_p'),true,$('#l_r').checked);if(e){$('#lerr').innerHTML=`<div class="msg err">${e}</div>`;return}await waitMe();location.hash='#/admin/dashboard'}
const money=o=>o.deducted&&o.status!=='dibatalkan';
async function seedFirestore(){
 if(!confirm('Isi database dengan data awal (produk, ongkir, voucher, pengaturan)? Data dengan ID yang sama akan ditimpa.'))return;
 const d=seed();const b=fs.batch();
 d.products.forEach(p=>b.set(fs.collection('products').doc(p.id),clean(p)));
 d.vouchers.forEach(v=>b.set(fs.collection('vouchers').doc(v.code),v));
 b.set(fs.collection('config').doc('main'),clean({settings:d.settings,cats:d.cats,zones:d.zones,banners:d.banners,banks:d.banks,qris:d.qris}));
 try{await b.commit();audit('Seed data awal');toast('Data awal tersimpan.');pageDash()}catch(e){fail(e)}}
function pageDash(){
 const t0=new Date();t0.setHours(0,0,0,0);const tod=db.orders.filter(o=>o.created>=t0.getTime());
 const days=[...Array(7)].map((_,i)=>{const d=new Date(t0);d.setDate(d.getDate()-6+i);return{d,v:db.orders.filter(o=>money(o)&&o.created>=d.getTime()&&o.created<d.getTime()+864e5).reduce((a,o)=>a+o.total,0)}});
 const mx=Math.max(1,...days.map(x=>x.v));const low=db.products.filter(p=>!p.deleted&&p.stock<=p.min);
 const sold={};db.orders.filter(money).forEach(o=>o.items.forEach(i=>sold[i.name]=(sold[i.name]||0)+i.qty));const top=Object.entries(sold).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const byK={};db.orders.filter(money).forEach(o=>byK[o.kec]=(byK[o.kec]||0)+1);
 admShell(`<h2>Dashboard</h2>${(!CFGX||!db.products.length)?`<div class="msg">Database masih kosong. <button class="btn sm" onclick="seedFirestore()">ISI DATA AWAL (DEMO)</button></div>`:''}<p><button class="btn sm ${S().open?'leaf':'bad'}" onclick="db.settings.open=!db.settings.open;audit('Status toko',db.settings.open?'buka':'tutup');saveCfg();pageDash()">${S().open?'🟢 TOKO BUKA — klik untuk menutup':'🔴 TOKO TUTUP — klik untuk membuka'}</button></p><div class="kpis"><div class="card kpi"><b>${rp(tod.filter(money).reduce((a,o)=>a+o.total,0))}</b><span>Pendapatan hari ini</span></div><div class="card kpi"><b>${tod.length}</b><span>Pesanan hari ini</span></div><div class="card kpi"><b>${db.orders.filter(o=>['dikonfirmasi','diproses','dikemas'].includes(o.status)).length}</b><span>Pesanan diproses</span></div><div class="card kpi"><b>${db.orders.filter(o=>o.status==='dikirim').length}</b><span>Pesanan dikirim</span></div><div class="card kpi"><b>${low.length}</b><span>Stok hampir habis</span></div><div class="card kpi"><b>${db.users.filter(u=>u.role==='customer').length}</b><span>Total pelanggan</span></div></div>
 ${low.map(p=>`<div class="msg">⚠️ Stok ${esc(p.name)} tinggal ${fmtN(p.stock)} ${unitLbl(p.unit)}.</div>`).join('')}
 <div class="cols"><div class="card pad"><h3>Penjualan 7 hari</h3><svg viewBox="0 0 320 150" width="100%" role="img" aria-label="Grafik penjualan harian">${days.map((x,i)=>{const h=Math.round(x.v/mx*100);return`<rect x="${i*45+8}" y="${115-h}" width="32" height="${h}" fill="var(--brick)" rx="3"/><text x="${i*45+24}" y="132" font-size="10" text-anchor="middle" fill="var(--mut)">${x.d.getDate()}/${x.d.getMonth()+1}</text>${x.v?`<text x="${i*45+24}" y="${110-h}" font-size="8" text-anchor="middle" fill="var(--ink)">${Math.round(x.v/1000)}k</text>`:''}`}).join('')}</svg></div>
 <div class="card pad"><h3>Produk terlaris</h3>${top.length?top.map(t=>`<div style="display:flex;justify-content:space-between"><span>${esc(t[0])}</span><b>${fmtN(t[1])}</b></div>`).join(''):'<p>Belum ada data.</p>'}<h3 style="margin-top:14px">Pesanan per kecamatan</h3>${Object.keys(byK).length?Object.entries(byK).map(t=>`<div style="display:flex;justify-content:space-between"><span>${esc(t[0])}</span><b>${t[1]}</b></div>`).join(''):'<p>Belum ada data.</p>'}</div></div>
 <h3 style="margin-top:18px">Notifikasi</h3>${db.anotifs.slice(0,6).map(n=>`<div class="msg">${esc(n.text)} <small>${fmtD(n.t)}</small></div>`).join('')||'<p>Belum ada notifikasi.</p>'}`,'dashboard')}
let ofil='semua';
function pageAdminOrders(){
 const l=db.orders.filter(o=>ofil==='semua'||o.status===ofil);
 admShell(`<h2>Pesanan</h2><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><select onchange="ofil=this.value;pageAdminOrders()" style="max-width:220px" aria-label="Filter status"><option value="semua">Semua status</option>${[...STEPS.map(s=>s[0]),'dibatalkan'].map(s=>`<option ${ofil===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn sm alt" onclick="exportCSV()">Export CSV</button></div>
 <div class="tw card"><table><tr><th>No.</th><th>Pelanggan</th><th>Kecamatan</th><th>Total</th><th>Bayar</th><th>Status</th></tr>${l.length?l.map(o=>`<tr style="cursor:pointer" onclick="admOrder('${o.id}')"><td><a href="javascript:void 0">${o.no}</a></td><td>${esc(o.name)}</td><td>${esc(o.kec)}</td><td>${rp(o.total)}</td><td>${payLbl[o.pay]}</td><td>${o.status}</td></tr>`).join(''):'<tr><td colspan="6">Belum ada pesanan.</td></tr>'}</table></div>`,'orders')}
function csvBox(title,rows){modal(`<h3>${title}</h3><p>Salin teks ini lalu tempel ke Excel atau Google Sheets.</p><textarea rows="10" onclick="this.select()" aria-label="CSV">${esc(rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n'))}</textarea><p><button class="btn" onclick="closeModal()">Tutup</button></p>`)}
function exportCSV(){csvBox('Export CSV',[['no','tanggal','pelanggan','kecamatan','metode','status_bayar','status','total'],...db.orders.map(o=>[o.no,new Date(o.created).toISOString(),o.name,o.kec,o.method,o.pay,o.status,o.total])])}
function admOrder(id){const o=db.orders.find(x=>x.id===id);if(!o)return;const i=stIdx(o.status),nx=STEPS[i+1];
 modal(`<h3>${o.no}</h3><p>${esc(o.name)} · ${esc(o.phone)}<br>${esc(o.addr)}, ${esc(o.desa)} ${esc(o.kec)}<br>Patokan: ${esc(o.patokan)||'-'} · Catatan: ${esc(o.note)||'-'} · ${esc(o.slot)}</p>${o.items.map(x=>`<div>${esc(x.name)} × ${x.qty} = ${rp(x.lt)}</div>`).join('')}<p><b>Total ${rp(o.total)}</b> (${o.method.toUpperCase()}) — ${payLbl[o.pay]}</p>${o.proof?`<a href="${esc(o.proof)}" target="_blank" rel="noopener"><img src="${esc(o.proof)}" alt="Bukti pembayaran" style="max-width:100%;max-height:300px"></a>`:''}
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${o.status==='dibuat'&&o.pay==='menunggu_verifikasi'?`<button class="btn sm leaf" onclick="verifyPay('${o.id}',true)">Verifikasi pembayaran</button><button class="btn sm bad" onclick="verifyPay('${o.id}',false)">Tolak</button>`:''}
 ${o.status==='dibuat'&&o.method==='cod'?`<button class="btn sm leaf" onclick="confirmOrder('${o.id}')">Konfirmasi pesanan (COD)</button>`:''}
 ${i>=1&&nx?`<button class="btn sm" onclick="setStatus('${o.id}','${nx[0]}')">→ ${nx[1]}</button>`:''}
 ${!['selesai','dibatalkan'].includes(o.status)?`<button class="btn sm bad" onclick="cancelOrder('${o.id}')">Batalkan</button>`:''}<a class="btn sm alt" href="#/invoice/${o.id}" onclick="closeModal()">Invoice</a><button class="btn sm alt" onclick="closeModal()">Tutup</button></div><div id="oerr"></div>`)}
const trkRef=o=>fs.collection('tracking').doc(o.no.slice(1));
async function confirmOrder(id){const o=db.orders.find(x=>x.id===id);if(o.deducted)return true;
 for(const i of o.items){const p=prod(i.pid);if(!p||p.stock<i.qty){const e=$('#oerr');if(e)e.innerHTML='<div class="msg err">Stok tidak mencukupi.</div>';return false}}
 const log=(o.log||[]).concat({t:NOW(),s:'dikonfirmasi'});const b=fs.batch();
 o.items.forEach(i=>b.update(fs.collection('products').doc(i.pid),{stock:FV.increment(-i.qty)}));
 b.update(fs.collection('orders').doc(o.id),{deducted:true,status:'dikonfirmasi',log});
 b.set(trkRef(o),{no:o.no,status:'dikonfirmasi',created:o.created},{merge:true});
 try{await b.commit()}catch(e){fail(e);return false}
 o.items.forEach(i=>{const p=prod(i.pid);if(p){p.stock=+(p.stock-i.qty).toFixed(2);audit('Stok berubah',p.name+' -'+i.qty);if(p.stock<=p.min)notif('admin','⚠️ Stok '+p.name+' tinggal '+fmtN(p.stock)+' '+unitLbl(p.unit)+'.')}});
 o.deducted=true;o.status='dikonfirmasi';o.log=log;notif(o.uid,'Pembayaran pesanan '+o.no+' telah dikonfirmasi.');audit('Pesanan dikonfirmasi',o.no);admOrder(id);pageAdminOrdersBg();return true}
async function verifyPay(id,ok){const o=db.orders.find(x=>x.id===id);
 if(ok){if(!(await confirmOrder(id)))return;try{await fs.collection('orders').doc(id).update({pay:'diverifikasi'})}catch(e){return fail(e)}o.pay='diverifikasi';audit('Pembayaran diverifikasi',o.no)}
 else{try{await fs.collection('orders').doc(id).update({pay:'ditolak'})}catch(e){return fail(e)}o.pay='ditolak';notif(o.uid,'Bukti pembayaran '+o.no+' ditolak. Silakan unggah ulang.');audit('Pembayaran ditolak',o.no)}
 admOrder(id);pageAdminOrdersBg()}
async function setStatus(id,s){const o=db.orders.find(x=>x.id===id);const log=(o.log||[]).concat({t:NOW(),s});const upd={status:s,log};if(s==='selesai'&&o.method==='cod')upd.pay='diverifikasi';
 const b=fs.batch();b.update(fs.collection('orders').doc(id),upd);b.set(trkRef(o),{no:o.no,status:s,created:o.created},{merge:true});
 try{await b.commit()}catch(e){return fail(e)}
 Object.assign(o,upd);notif(o.uid,s==='dikirim'?'Pesanan Anda sedang dalam perjalanan.':s==='selesai'?'Pesanan telah selesai. Terima kasih telah berbelanja.':'Status pesanan '+o.no+': '+s);audit('Pesanan berubah',o.no+' → '+s);admOrder(id);pageAdminOrdersBg()}
async function cancelOrder(id){if(!confirm('Batalkan pesanan ini?'))return;const o=db.orders.find(x=>x.id===id);const log=(o.log||[]).concat({t:NOW(),s:'dibatalkan'});const b=fs.batch();
 if(o.deducted)o.items.forEach(i=>{if(prod(i.pid))b.update(fs.collection('products').doc(i.pid),{stock:FV.increment(i.qty)})});
 b.update(fs.collection('orders').doc(id),{status:'dibatalkan',log});b.set(trkRef(o),{no:o.no,status:'dibatalkan',created:o.created},{merge:true});
 try{await b.commit()}catch(e){return fail(e)}
 o.status='dibatalkan';o.log=log;notif(o.uid,'Pesanan '+o.no+' dibatalkan.');audit('Pesanan dibatalkan',o.no);closeModal();pageAdminOrders()}
function pageAdminOrdersBg(){const m=$('#modal').innerHTML;pageAdminOrders();$('#modal').innerHTML=m}

function pageAdminProducts(){
 admShell(`<h2>Produk · Harga · Stok</h2><p><button class="btn sm" onclick="prodForm()">+ Produk</button></p><div class="tw card"><table><tr><th>Produk</th><th>Harga</th><th>Stok</th><th>Status</th><th></th></tr>${db.products.filter(p=>!p.deleted).map(p=>`<tr><td>${p.emoji}${esc(p.name)}</td><td>${rp(p.price)}/${unitLbl(p.unit)}${promoOn(p)?'<br><span class="tag promo">Promo '+rp(p.promo.price)+'</span>':''}</td><td>${fmtN(p.stock)} <small>${stockSt(p.stock)[0]}</small></td><td>${p.active?'Aktif':'Nonaktif'}</td><td><button class="btn sm alt" onclick="prodForm('${p.id}')">Edit</button></td></tr>`).join('')||'<tr><td colspan="5">Belum ada produk.</td></tr>'}</table></div>
 <h3 style="margin-top:20px">Riwayat perubahan harga</h3><div class="tw card"><table><tr><th>Tanggal</th><th>Produk</th><th>Harga</th><th>Admin</th><th>Alasan</th></tr>${db.priceHistory.length?db.priceHistory.map(h=>`<tr><td>${fmtD(h.t)}</td><td>${esc(h.name)}</td><td>${rp(h.o)} →${rp(h.n)}</td><td>${esc(h.by)}</td><td>${esc(h.why)}</td></tr>`).join(''):'<tr><td colspan="5">Belum ada perubahan.</td></tr>'}</table></div>`,'products')}
function prodForm(id){const p=id?prod(id):{name:'',cat:'ayam-potong',unit:'kg',price:0,wholesale:0,promo:null,tiers:[],stock:0,min:10,active:true,emoji:'🐔',desc:''};const pr=p.promo||{};
 modal(`<h3>${id?'Edit':'Tambah'} produk</h3><div class="cols"><div><label for="f_n">Nama</label><input id="f_n" value="${esc(p.name)}"></div><div><label for="f_c">Kategori</label><select id="f_c">${CATS.map(c=>`<option value="${c[0]}" ${c[0]===p.cat?'selected':''}>${esc(c[1])}</option>`).join('')}</select></div>
 <div><label for="f_u">Satuan</label><select id="f_u">${['kg','500g','250g','ekor','paket'].map(u=>`<option value="${u}" ${u===p.unit?'selected':''}>${unitLbl(u)}</option>`).join('')}</select></div><div><label for="f_p">Harga normal (Rp)</label><input id="f_p" type="number" min="0" value="${p.price}"></div>
 <div><label for="f_w">Harga grosir (Rp)</label><input id="f_w" type="number" min="0" value="${p.wholesale}"></div><div><label for="f_s">Stok tersedia</label><input id="f_s" type="number" min="0" step="0.1" value="${fmtN(p.stock)}"></div>
 <div><label for="f_m">Stok minimum</label><input id="f_m" type="number" min="0" value="${p.min}"></div><div><label for="f_e">Emoji</label><input id="f_e" value="${esc(p.emoji)}"></div><div><label for="f_i">Foto produk</label><input id="f_i" type="file" accept="image/*"></div><div><label for="f_5">Harga/500 g (Rp)</label><input id="f_5" type="number" min="0" value="${p.p500||''}"></div><div><label for="f_k">Harga/ekor (Rp)</label><input id="f_k" type="number" min="0" value="${p.pEkor||''}"></div>
 <div><label for="f_pp">Harga promo (Rp)</label><input id="f_pp" type="number" min="0" value="${pr.price||''}"></div><div></div><div><label for="f_ps">Promo mulai</label><input id="f_ps" type="date" value="${pr.start||''}"></div><div><label for="f_pe">Promo berakhir</label><input id="f_pe" type="date" value="${pr.end||''}"></div></div>
 <label for="f_t">Harga bertingkat (format "min:harga", satu per baris)</label><textarea id="f_t" rows="3">${(p.tiers||[]).map(t=>t.min+':'+t.price).join('\n')}</textarea><label for="f_d">Deskripsi</label><textarea id="f_d" rows="2">${esc(p.desc)}</textarea>
 <label for="f_r">Alasan perubahan harga</label><input id="f_r" placeholder="mis. Harga pasar naik"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="f_a" style="width:auto;min-height:0" ${p.active?'checked':''}> Produk aktif</label><div id="oerr"></div>
 <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn" onclick="saveProd('${id||''}')">SIMPAN HARGA</button><button class="btn alt" onclick="closeModal()">Batal</button>${id?`<button class="btn bad" onclick="delProd('${id}')">Hapus</button>`:''}</div>`)}
async function saveProd(id){const E=m=>$('#oerr').innerHTML=`<div class="msg err">${m}</div>`;const name=V('f_n').trim(),price=Math.round(+V('f_p'));if(!name||!(price>=0))return E('Nama dan harga wajib diisi.');
 const p=id?prod(id):null;const pid=id||'p'+uid();
 if(p&&p.price!==price&&!V('f_r').trim())return E('Isi alasan perubahan harga.');
 try{
  let img=(p&&p.img)||'';if($('#f_i').files[0])img=await upImg('products/'+pid+'.jpg',$('#f_i').files[0],600);
  const tiers=V('f_t').split('\n').map(l=>l.trim().split(':')).filter(a=>a.length===2&&+a[0]>0&&+a[1]>0).map(a=>({min:+a[0],price:+a[1]}));
  const promo=V('f_pp')?{price:+V('f_pp'),start:V('f_ps'),end:V('f_pe')}:null;
  const d={id:pid,img,p500:+V('f_5')||0,pEkor:+V('f_k')||0,name,cat:V('f_c'),unit:V('f_u'),price,wholesale:Math.round(+V('f_w')||0),stock:+V('f_s')||0,min:+V('f_m')||0,emoji:V('f_e')||'🐔',desc:V('f_d'),tiers,promo,active:$('#f_a').checked,updated:NOW()};
  if(!p){d.slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+uid().slice(0,3);d.deleted=false;d.ord=NOW()}
  const b=fs.batch();b.set(fs.collection('products').doc(pid),clean(d),{merge:true});
  if(p&&p.price!==price)b.set(fs.collection('priceHistory').doc(),{t:NOW(),pid,name:p.name,o:p.price,n:price,by:me().name,why:V('f_r').trim()});
  await b.commit();
  if(p&&p.price!==price)audit('Harga berubah',p.name+' '+p.price+'→'+price);
  if(p&&fmtN(p.stock)!==d.stock)audit('Stok berubah',p.name+' '+fmtN(p.stock)+'→'+d.stock);
  if(!p)audit('Produk ditambahkan',name);
 }catch(e){fail(e);return E('Gagal menyimpan produk.')}
 closeModal();toast('Tersimpan. Harga tampil otomatis di toko.');pageAdminProducts()}
async function delProd(id){if(!confirm('Hapus produk? (soft delete, riwayat pesanan tetap aman)'))return;const p=prod(id);
 try{await fs.collection('products').doc(id).update({deleted:true,active:false})}catch(e){return fail(e)}audit('Produk dihapus',p.name);closeModal();pageAdminProducts()}

function pageAdminShipping(){admShell(`<h2>Ongkir & Wilayah</h2><div class="tw card"><table><tr><th>Kecamatan</th><th>Ongkir</th><th>COD</th><th>Aktif</th></tr>${db.zones.map((z,i)=>`<tr><td>${esc(z.k)}</td><td><input type="number" min="0" value="${z.fee}" style="max-width:120px" onchange="db.zones[${i}].fee=+this.value;audit('Ongkir diubah','${esc(z.k)} '+this.value);saveCfg()" aria-label="Ongkir ${esc(z.k)}"></td><td><input type="checkbox" ${z.cod?'checked':''} style="width:auto;min-height:0" onchange="db.zones[${i}].cod=this.checked;saveCfg()" aria-label="COD"></td><td><input type="checkbox" ${z.active?'checked':''} style="width:auto;min-height:0" onchange="db.zones[${i}].active=this.checked;audit('Wilayah diubah','${esc(z.k)}');saveCfg()" aria-label="Aktif"></td></tr>`).join('')}</table></div><div class="card pad" style="max-width:420px;margin-top:12px"><h3>Tambah wilayah</h3><label for="z_k">Nama kecamatan / wilayah</label><input id="z_k"><label for="z_f">Ongkir (Rp)</label><input id="z_f" type="number" min="0"><p><button class="btn" onclick="addZone()">TAMBAH</button></p></div><p class="msg">Tarif awal adalah contoh — sesuaikan dengan tarif Anda. Kecamatan nonaktif belum punya tarif.</p>`,'shipping')}
function addZone(){const k=V('z_k').trim();if(!k||db.zones.some(z=>z.k.toLowerCase()===k.toLowerCase())){toast('Nama kosong atau sudah ada.');return}db.zones.push({k,fee:+V('z_f')||0,cod:true,active:true});audit('Wilayah ditambah',k);saveCfg();pageAdminShipping()}
function saveVoucher(i){const v=db.vouchers[i];fs.collection('vouchers').doc(v.code).set(clean(v)).catch(fail)}
function pageAdminVouchers(){admShell(`<h2>Voucher & Promo</h2><div class="tw card"><table><tr><th>Kode</th><th>Jenis</th><th>Nilai</th><th>Min. belanja</th><th>Aktif</th></tr>${db.vouchers.map((v,i)=>`<tr><td>${esc(v.code)}</td><td>${v.type}</td><td>${v.value}</td><td>${rp(v.min)}</td><td><input type="checkbox" ${v.active?'checked':''} style="width:auto;min-height:0" onchange="db.vouchers[${i}].active=this.checked;saveVoucher(${i})" aria-label="Aktif"></td></tr>`).join('')}</table></div>
 <div class="card pad" style="margin-top:14px;max-width:480px"><h3>Buat voucher</h3><label for="v_c">Kode</label><input id="v_c"><label for="v_t">Jenis</label><select id="v_t"><option value="persen">Diskon persen</option><option value="nominal">Diskon nominal</option><option value="gratis_ongkir">Gratis ongkir</option></select><label for="v_v">Nilai (% atau Rp)</label><input id="v_v" type="number" min="0"><label for="v_m">Minimal belanja (Rp)</label><input id="v_m" type="number" min="0" value="0"><p><button class="btn" onclick="addVoucher()">SIMPAN VOUCHER</button></p></div><h3 style="margin-top:18px">Promo harga khusus / flash sale</h3><div class="tw card"><table><tr><th>Produk</th><th>Harga promo</th><th>Periode</th><th>Status</th></tr>${db.products.filter(p=>p.promo&&p.promo.price&&!p.deleted).map(p=>`<tr><td>${esc(p.name)}</td><td>${rp(p.promo.price)}</td><td>${esc(p.promo.start||'-')} s/d ${esc(p.promo.end||'-')}</td><td>${promoOn(p)?'Berlaku':'Tidak berlaku'}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada promo harga.</td></tr>'}</table></div><p class="msg">Atur promo: buka menu Produk → Edit → isi "Harga promo" dan tanggal mulai/berakhir.</p>`,'vouchers')}
async function addVoucher(){const c=V('v_c').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'');if(!c||db.vouchers.some(v=>v.code===c)){toast('Kode kosong atau sudah dipakai.');return}
 const v={code:c,type:V('v_t'),value:+V('v_v')||0,min:+V('v_m')||0,active:true};
 try{await fs.collection('vouchers').doc(c).set(v)}catch(e){return fail(e)}
 if(!db.vouchers.some(x=>x.code===c))db.vouchers.push(v);audit('Voucher dibuat',c);pageAdminVouchers()}
function pageAdminPayments(){const q=db.qris;admShell(`<h2>Pembayaran</h2><div class="card pad" style="max-width:520px"><h3>QRIS</h3>${q.img?`<img src="${esc(q.img)}" alt="QRIS" style="max-width:220px">`:'<p>Belum ada gambar QRIS.</p>'}<label for="q_f">Unggah gambar QRIS</label><input id="q_f" type="file" accept="image/*" onchange="upQris(this)"><label for="q_m">Nama merchant</label><input id="q_m" value="${esc(q.merchant)}"><label for="q_i">ID merchant</label><input id="q_i" value="${esc(q.mid)}"><p><button class="btn" onclick="db.qris.merchant=V('q_m');db.qris.mid=V('q_i');audit('QRIS diubah');saveCfg();toast('Tersimpan')">SIMPAN</button></p></div>
 <h3 style="margin-top:20px">Rekening bank</h3><div class="tw card"><table><tr><th>Bank</th><th>No. rekening</th><th>Atas nama</th><th></th></tr>${db.banks.map((b,i)=>`<tr><td>${esc(b.bank)}</td><td>${esc(b.no)}</td><td>${esc(b.holder)}${b.demo?'<span class="tag w">DEMO</span>':''}</td><td><button class="btn sm alt" onclick="db.banks.splice(${i},1);saveCfg();pageAdminPayments()">Hapus</button></td></tr>`).join('')||'<tr><td colspan="4">Belum ada rekening.</td></tr>'}</table></div>
 <div class="card pad" style="margin-top:12px;max-width:520px"><h3>Tambah rekening</h3><label for="b_b">Nama bank</label><input id="b_b"><label for="b_n">Nomor rekening</label><input id="b_n" inputmode="numeric"><label for="b_h">Nama pemilik</label><input id="b_h"><p><button class="btn" onclick="addBank()">TAMBAH</button></p></div><p class="msg">Payment gateway belum terhubung: pembayaran memakai verifikasi manual bukti transfer.</p>`,'payments')}
async function upQris(i){if(i.files[0]){try{toast('Mengunggah…');db.qris.img=await upImg('config/qris.jpg',i.files[0],800);await saveCfg();audit('QRIS diubah');pageAdminPayments()}catch(e){fail(e)}}}
function addBank(){if(!V('b_b')||!V('b_n')||!V('b_h')){toast('Lengkapi data rekening.');return}db.banks.push({id:uid(),bank:V('b_b'),no:V('b_n'),holder:V('b_h'),demo:false});saveCfg();pageAdminPayments()}
const SF=[['name','Nama toko'],['slogan','Slogan'],['wa','Nomor WhatsApp (format 628…)'],['email','Email'],['address','Alamat toko'],['maps','Link Google Maps'],['hoursText','Jam operasional'],['ig','Instagram'],['fb','Facebook'],['tt','TikTok']];
function pageAdminSettings(){const s=S();admShell(`<h2>Pengaturan</h2><div class="card pad" style="max-width:560px"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="s_open" style="width:auto;min-height:0" ${s.open?'checked':''}> ${s.open?'🟢 TOKO BUKA':'🔴 TOKO TUTUP'} (centang = buka)</label><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="s_ac" style="width:auto;min-height:0" ${s.acceptClosed?'checked':''}> Terima pesanan saat toko tutup</label><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="s_cod" style="width:auto;min-height:0" ${s.cod?'checked':''}> Aktifkan COD</label>
 ${SF.map(f=>`<label for="s_${f[0]}">${f[1]}</label><input id="s_${f[0]}" value="${esc(s[f[0]])}">`).join('')}
 <div class="cols"><div><label for="s_min">Minimal order (Rp)</label><input id="s_min" type="number" value="${s.minTotal}"></div><div><label for="s_ft">Gratis ongkir min. belanja (Rp, 0=nonaktif)</label><input id="s_ft" type="number" value="${s.freeMinTotal}"></div><div><label for="s_fk">Gratis ongkir min. kg (0=nonaktif)</label><input id="s_fk" type="number" value="${s.freeMinKg}"></div><div></div><div><label for="s_sv">Diskon member Silver (%)</label><input id="s_sv" type="number" value="${s.silver}"></div><div><label for="s_gd">Diskon member Gold (%)</label><input id="s_gd" type="number" value="${s.gold}"></div></div>
 <label for="s_sl">Slot pengiriman (satu per baris)</label><textarea id="s_sl" rows="3">${esc(s.slots.join('\n'))}</textarea><p><button class="btn" onclick="saveSet()">SIMPAN PENGATURAN</button></p></div><div class="card pad" style="max-width:560px;margin-top:14px"><h3>Logo toko</h3><input type="file" id="s_logo" accept="image/*" onchange="upLogo(this)" aria-label="Unggah logo"><p><button class="btn alt sm" onclick="db.settings.logo='';saveCfg();pageAdminSettings()">Pakai logo bawaan</button></p><h3>Backup</h3><p class="msg">Data tersimpan di Firestore. Untuk backup, aktifkan ekspor terjadwal di Google Cloud Console atau gunakan <code>gcloud firestore export</code>.</p></div>`,'settings')}
async function saveSet(){const s=S();SF.forEach(f=>s[f[0]]=V('s_'+f[0]).trim());s.open=$('#s_open').checked;s.acceptClosed=$('#s_ac').checked;s.cod=$('#s_cod').checked;s.minTotal=+V('s_min')||0;s.freeMinTotal=+V('s_ft')||0;s.freeMinKg=+V('s_fk')||0;s.silver=+V('s_sv')||0;s.gold=+V('s_gd')||0;s.slots=V('s_sl').split('\n').map(x=>x.trim()).filter(Boolean);audit('Pengaturan diubah');await saveCfg();toast('Pengaturan tersimpan.');pageAdminSettings()}
async function upLogo(i){if(i.files[0]){try{db.settings.logo=await upImg('config/logo.jpg',i.files[0],160);await saveCfg();audit('Logo diubah');pageAdminSettings()}catch(e){fail(e)}}}
function pageAdminAdmins(){const u=me(),sa=u.role==='super_admin';
 admShell(`<h2>Admin & Pelanggan</h2><h3>Admin</h3><div class="tw card"><table><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Login terakhir</th><th></th></tr>${db.users.filter(isAdm).map(a=>`<tr><td>${esc(a.name)}</td><td>${esc(a.email)}</td><td>${a.role}</td><td>${a.active!==false?'Aktif':'Nonaktif'}</td><td>${a.last?fmtD(a.last):'-'}</td><td>${sa&&a.id!==u.id?`<button class="btn sm alt" onclick="togUser('${a.id}')">${a.active!==false?'Nonaktifkan':'Aktifkan'}</button> <button class="btn sm alt" onclick="togRole('${a.id}')">Ubah role</button>`:''}</td></tr>`).join('')}</table></div>
 <p class="msg">${sa?'Untuk menambah admin: minta orangnya mendaftar sebagai pelanggan, lalu klik "Jadikan admin" di tabel pelanggan di bawah.':'Hanya Super Admin yang dapat mengelola admin.'}</p>
 <h3 style="margin-top:22px">Pelanggan</h3><div class="tw card"><table><tr><th>Nama</th><th>Email / WA</th><th>Member</th><th>Grosir</th><th>Aktif</th>${sa?'<th></th>':''}</tr>${db.users.filter(x=>x.role==='customer').map(c=>`<tr><td>${esc(c.name)}${c.wsReq&&!c.wholesale?' <span class="tag w">Ajukan grosir</span>':''}<br><small>${db.orders.filter(o=>o.uid===c.id).length} pesanan</small></td><td>${esc(c.email)}<br>${esc(c.phone)}</td><td><select onchange="setUser('${c.id}','level',this.value)" aria-label="Level">${['regular','silver','gold'].map(l=>`<option ${c.level===l?'selected':''}>${l}</option>`).join('')}</select></td><td><input type="checkbox" ${c.wholesale?'checked':''} style="width:auto;min-height:0" onchange="setUser('${c.id}','wholesale',this.checked)" aria-label="Grosir"></td><td><input type="checkbox" ${c.active!==false?'checked':''} style="width:auto;min-height:0" onchange="setUser('${c.id}','active',this.checked)" aria-label="Aktif"></td>${sa?`<td><button class="btn sm alt" onclick="promote('${c.id}')">Jadikan admin</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${sa?6:5}">Belum ada pelanggan.</td></tr>`}</table></div>`,'admins')}
function setUser(id,k,v){fs.collection('users').doc(id).update({[k]:v}).then(()=>audit('Pelanggan diubah',k+'='+v)).catch(fail)}
async function togUser(id){const a=db.users.find(x=>x.id===id);const n=a.active===false;try{await fs.collection('users').doc(id).update({active:n})}catch(e){return fail(e)}audit(n?'Admin diaktifkan':'Admin dinonaktifkan',a.email);a.active=n;pageAdminAdmins()}
async function togRole(id){const a=db.users.find(x=>x.id===id);const r=a.role==='admin'?'super_admin':'admin';if(!confirm('Ubah role '+a.email+' menjadi '+r+'?'))return;try{await fs.collection('users').doc(id).update({role:r})}catch(e){return fail(e)}audit('Role diubah',a.email+' → '+r);a.role=r;pageAdminAdmins()}
async function promote(id){const a=db.users.find(x=>x.id===id);if(!confirm('Jadikan '+a.email+' sebagai admin? Ia akan bisa mengelola pesanan, harga, dan stok.'))return;try{await fs.collection('users').doc(id).update({role:'admin'})}catch(e){return fail(e)}audit('Admin ditambahkan',a.email);a.role='admin';pageAdminAdmins()}
function pageAdminAudit(){admShell(`<h2>Audit Log</h2><div class="tw card"><table><tr><th>Waktu</th><th>Oleh</th><th>Aksi</th><th>Detail</th></tr>${db.audit.map(a=>`<tr><td>${fmtD(a.t)}</td><td>${esc(a.by)}</td><td>${esc(a.a)}</td><td>${esc(a.d)}</td></tr>`).join('')||'<tr><td colspan="4">Belum ada log.</td></tr>'}</table></div>`,'audit-logs')}

/* ============ FITUR TAMBAHAN ============ */
const safeLink=l=>/^(#\/|https?:\/\/)/.test(l||'')?l:'#/produk';
const heart=id=>{const u=me();const on=u&&(u.wish||[]).includes(id);return `<button onclick="togWish('${id}')" aria-label="${on?'Hapus dari favorit':'Tambah ke favorit'}" style="position:absolute;top:8px;right:8px;border:0;background:#fffd;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:1.1rem">${on?'❤️':'🤍'}</button>`};
function togWish(id){const u=me();if(!u){toast('Masuk dulu untuk menyimpan favorit.');location.hash='#/login';return}const w=u.wish||[];u.wish=w.includes(id)?w.filter(x=>x!==id):[...w,id];fs.collection('users').doc(u.id).update({wish:u.wish}).catch(fail);const y=window.scrollY;router();window.scrollTo(0,y)}
function bannerHtml(){return db.banners.filter(x=>x.active).slice(0,3).map(x=>`<div style="background:var(--gold);color:#2B1F18"><div class="wrap" style="display:flex;gap:12px;align-items:center;padding:10px 16px;flex-wrap:wrap">${x.img?`<img src="${esc(x.img)}" alt="" style="height:44px;border-radius:6px">`:'<span aria-hidden="true">🎉</span>'}<div style="flex:1;min-width:200px"><b>${esc(x.title)}</b> ${esc(x.desc)}</div>${x.btn?`<a class="btn sm" href="${esc(safeLink(x.link))}">${esc(x.btn)}</a>`:''}</div></div>`).join('')}
function homeExtra(){const zs=db.zones.filter(z=>z.active);const rv=db.reviews.filter(r=>!r.hidden).slice(0,3);
 return `<section class="s alt-bg"><div class="wrap"><h2>Area pengiriman Lombok Timur</h2><p>Kami mengantar ayam potong segar ke kecamatan yang aktif di Kabupaten Lombok Timur, termasuk Selong, Masbagik, Aikmel, dan Labuhan Haji.</p><div style="display:flex;flex-wrap:wrap;gap:8px">${zs.map(z=>`<span class="tag" style="font-size:.85rem;padding:5px 12px">${esc(z.k)} ·${rp(z.fee)}</span>`).join('')}</div><p><small>Gratis ongkir untuk belanja ${rp(S().freeMinTotal)} ke atas atau minimal ${S().freeMinKg} kg.</small></p></div></section>
 ${rv.length?`<section class="s"><div class="wrap"><h2>Kata pelanggan</h2><div class="grid">${rv.map(r=>`<div class="card pad">${'⭐'.repeat(r.star)}<p>${esc(r.text)}</p><b>${esc(r.name)}</b> ${r.verified?'<span class="tag ok">Verified Purchase</span>':''}</div>`).join('')}</div></div></section>`:''}
 <section class="s"><div class="wrap" style="max-width:760px"><h2>Jual ayam potong online di Lombok Timur</h2><p>${esc(S().name)} adalah usaha lokal yang menjual ayam potong segar untuk rumah tangga, warung nasi, rumah makan, katering, dan pedagang pasar. Pesan ayam segar Lotim dari Selong sampai Sembalun dengan harga transparan, dan dapatkan harga lebih hemat untuk pembelian grosir.</p></div></section>`}
function savedAddrSel(u){const l=db.addr.filter(a=>a.uid===u.id);return l.length?`<label for="c_sv">Alamat tersimpan</label><select id="c_sv" onchange="fillAddr(this.value)"><option value="">Pilih alamat tersimpan…</option>${l.map(a=>`<option value="${a.id}">${esc(a.label)} —${esc(a.kec)}</option>`).join('')}</select>`:''}
function fillAddr(id){const a=db.addr.find(x=>x.id===id);if(!a)return;$('#c_n').value=a.name;$('#c_w').value=a.phone;$('#c_k').value=a.kec;$('#c_d').value=a.desa;$('#c_a').value=a.addr;$('#c_p').value=a.patokan;updCo()}
function pageAddr(){const u=me();const l=db.addr.filter(a=>a.uid===u.id);
 acct(`<h2>Alamat saya</h2>${l.map(a=>`<div class="card pad" style="margin-bottom:8px;max-width:480px"><b>${esc(a.label)}</b><br>${esc(a.name)} ·${esc(a.phone)}<br>${esc(a.addr)},${esc(a.desa)} ${esc(a.kec)}<br><small>${esc(a.patokan)}</small><p><button class="btn sm alt" onclick="delAddr('${a.id}')">Hapus</button></p></div>`).join('')||'<div class="msg">Belum ada alamat tersimpan.</div>'}
 <div class="card pad" style="max-width:480px"><h3>Tambah alamat</h3><label for="ad_l">Label (mis. Rumah)</label><input id="ad_l"><label for="ad_n">Nama penerima</label><input id="ad_n" value="${esc(u.name)}"><label for="ad_w">WhatsApp</label><input id="ad_w" value="${esc(u.phone)}"><label for="ad_k">Kecamatan</label><select id="ad_k">${db.zones.filter(z=>z.active).map(z=>`<option>${esc(z.k)}</option>`).join('')}</select><label for="ad_d">Desa</label><input id="ad_d"><label for="ad_a">Alamat</label><textarea id="ad_a" rows="2"></textarea><label for="ad_p">Patokan rumah</label><input id="ad_p"><p><button class="btn" onclick="addAddr()">SIMPAN ALAMAT</button></p></div>`,'alamat')}
async function addAddr(){const u=me();if(!V('ad_l').trim()||!V('ad_a').trim()||!V('ad_n').trim()){toast('Lengkapi label, nama, dan alamat.');return}
 const a={id:uid(),label:V('ad_l').trim(),name:V('ad_n').trim(),phone:V('ad_w').trim(),kec:V('ad_k'),desa:V('ad_d').trim(),addr:V('ad_a').trim(),patokan:V('ad_p').trim()};
 try{await fs.collection('users').doc(u.id).collection('addresses').doc(a.id).set(a)}catch(e){return fail(e)}
 if(!db.addr.some(x=>x.id===a.id))db.addr.push(Object.assign({uid:u.id},a));toast('Alamat disimpan.');pageAddr()}
async function delAddr(id){const u=me();try{await fs.collection('users').doc(u.id).collection('addresses').doc(id).delete()}catch(e){return fail(e)}db.addr=db.addr.filter(a=>a.id!==id);pageAddr()}
function pageWish(){const u=me();const l=(u.wish||[]).map(prod).filter(p=>p&&p.active&&!p.deleted);acct(`<h2>Produk favorit</h2>${l.length?`<div class="grid">${l.map(pcard).join('')}</div>`:'<div class="msg">Belum ada produk favorit.</div>'}`,'wish')}
async function upAvatar(i){if(i.files[0]){const u=me();try{toast('Mengunggah…');const url=await upImg('avatars/'+u.id+'.jpg',i.files[0],240);await fs.collection('users').doc(u.id).update({avatar:url});u.avatar=url;pageAccount()}catch(e){fail(e)}}}
async function reqWs(){const u=me();try{await fs.collection('users').doc(u.id).update({wsReq:true})}catch(e){return fail(e)}u.wsReq=true;notif('admin','Pengajuan akun grosir dari '+u.name);toast('Pengajuan dikirim. Menunggu persetujuan admin.');pageAccount()}
function pageAdminCats(){admShell(`<h2>Kategori</h2><div class="tw card"><table><tr><th>Ikon</th><th>Nama</th><th>Aktif</th></tr>${db.cats.map((c,i)=>`<tr><td><input value="${esc(c.icon)}" style="max-width:70px" onchange="db.cats[${i}].icon=this.value;saveCfg();refreshCats()" aria-label="Ikon"></td><td><input value="${esc(c.name)}" onchange="db.cats[${i}].name=this.value;saveCfg();refreshCats()" aria-label="Nama kategori"></td><td><input type="checkbox" ${c.active?'checked':''} style="width:auto;min-height:0" onchange="db.cats[${i}].active=this.checked;saveCfg();refreshCats()" aria-label="Aktif"></td></tr>`).join('')}</table></div><div class="card pad" style="max-width:420px;margin-top:12px"><h3>Tambah kategori</h3><label for="k_i">Ikon (emoji)</label><input id="k_i" value="🐔"><label for="k_n">Nama</label><input id="k_n"><p><button class="btn" onclick="addCat()">TAMBAH</button></p></div>`,'categories')}
function addCat(){const n=V('k_n').trim();if(!n){toast('Nama wajib diisi.');return}db.cats.push({id:n.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+uid().slice(0,3),name:n,icon:V('k_i')||'🐔',active:true});audit('Kategori ditambah',n);saveCfg();refreshCats();pageAdminCats()}
function pageAdminBanners(){admShell(`<h2>Banner</h2>${db.banners.map((b,i)=>`<div class="card pad" style="margin-bottom:10px;max-width:560px"><input value="${esc(b.title)}" aria-label="Judul" placeholder="Judul" onchange="db.banners[${i}].title=this.value;saveCfg()"><input value="${esc(b.desc)}" aria-label="Deskripsi" placeholder="Deskripsi" style="margin-top:6px" onchange="db.banners[${i}].desc=this.value;saveCfg()"><div class="cols" style="margin-top:6px"><input value="${esc(b.btn)}" aria-label="Teks tombol" placeholder="Teks tombol" onchange="db.banners[${i}].btn=this.value;saveCfg()"><input value="${esc(b.link)}" aria-label="Link tombol" placeholder="#/produk" onchange="db.banners[${i}].link=this.value;saveCfg()"></div><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" ${b.active?'checked':''} style="width:auto;min-height:0" onchange="db.banners[${i}].active=this.checked;saveCfg()"> Aktif</label><input type="file" accept="image/*" aria-label="Gambar banner" onchange="upBanner(${i},this)">${b.img?`<img src="${esc(b.img)}" alt="" style="max-height:60px;margin-top:6px">`:''}<p><button class="btn sm bad" onclick="if(confirm('Hapus banner?')){db.banners.splice(${i},1);saveCfg();pageAdminBanners()}">Hapus</button></p></div>`).join('')||'<p>Belum ada banner.</p>'}<p><button class="btn" onclick="db.banners.push({id:uid(),title:'Judul banner',desc:'',btn:'Lihat',link:'#/produk',img:'',active:false});saveCfg();pageAdminBanners()">+ BANNER</button></p>`,'banners')}
async function upBanner(i,el){if(el.files[0]){try{db.banners[i].img=await upImg('banners/'+db.banners[i].id+'.jpg',el.files[0],500);await saveCfg();pageAdminBanners()}catch(e){fail(e)}}}
function toggleRev(id,show){fs.collection('reviews').doc(id).update({hidden:!show}).then(()=>audit('Review diubah',id)).catch(fail)}
function pageAdminReviews(){admShell(`<h2>Review</h2><div class="tw card"><table><tr><th>Produk</th><th>Pelanggan</th><th>Rating</th><th>Komentar</th><th>Tampil</th></tr>${db.reviews.map(r=>`<tr><td>${esc((prod(r.pid)||{}).name)}</td><td>${esc(r.name)}${r.verified?'<span class="tag ok">Verified</span>':''}</td><td>${'⭐'.repeat(r.star)}</td><td>${esc(r.text)}</td><td><input type="checkbox" ${r.hidden?'':'checked'} style="width:auto;min-height:0" onchange="toggleRev('${r.id}',this.checked)" aria-label="Tampilkan"></td></tr>`).join('')||'<tr><td colspan="5">Belum ada review.</td></tr>'}</table></div>`,'reviews')}
let rep={from:'',to:'',kec:'',pid:'',status:'',per:'harian'};
function repOrders(){const f=rep.from?new Date(rep.from+'T00:00:00').getTime():0,t=rep.to?new Date(rep.to+'T00:00:00').getTime()+864e5:Infinity;return db.orders.filter(o=>o.created>=f&&o.created<t&&(!rep.kec||o.kec===rep.kec)&&(!rep.status||o.status===rep.status)&&(!rep.pid||o.items.some(i=>i.pid===rep.pid)))}
function barList(obj,fmt){const e=Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,6);const mx=Math.max(1,...e.map(x=>x[1]));return e.length?e.map(x=>`<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:.88rem"><span>${esc(x[0])}</span><b>${fmt?fmt(x[1]):fmtN(x[1])}</b></div><div style="height:6px;background:var(--bg2);border-radius:3px"><div style="height:6px;width:${Math.round(x[1]/mx*100)}%;background:var(--leaf);border-radius:3px"></div></div></div>`).join(''):'<p>Belum ada data.</p>'}
const qtyTotal=o=>fmtN(Object.values(o).reduce((a,b)=>a+b,0));
function pageAdminReports(){
 const all=repOrders(),paid=all.filter(money),sumR=a=>a.reduce((s,o)=>s+o.total,0);
 const t0=new Date();t0.setHours(0,0,0,0);const wk=t0.getTime()-6*864e5,mo=new Date(t0.getFullYear(),t0.getMonth(),1).getTime();const ap=db.orders.filter(money);
 const sold={},cust={},meth={},kec={};
 paid.forEach(o=>{o.items.forEach(i=>{if(!rep.pid||i.pid===rep.pid)sold[i.name]=(sold[i.name]||0)+i.qty});cust[o.name]=(cust[o.name]||0)+o.total;const m={qris:'QRIS',transfer:'Transfer',cod:'COD'}[o.method];meth[m]=(meth[m]||0)+1;kec[o.kec]=(kec[o.kec]||0)+1});
 const b={};const dd=d=>String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
 paid.forEach(o=>{const d=new Date(o.created);let k,ts;if(rep.per==='bulanan'){k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');ts=new Date(d.getFullYear(),d.getMonth(),1).getTime()}else if(rep.per==='mingguan'){const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));k='Mgg '+dd(x);ts=x.getTime()}else{const x=new Date(d);x.setHours(0,0,0,0);k=dd(x);ts=x.getTime()}b[k]=b[k]||{ts,v:0};b[k].v+=o.total});
 const ser=Object.entries(b).sort((x,y)=>x[1].ts-y[1].ts).slice(-12);const mx=Math.max(1,...ser.map(x=>x[1].v));const bw=Math.floor(340/Math.max(ser.length,1));
 const sel=(id,v,opts)=>`<select id="${id}" onchange="rep.${id.slice(2)}=this.value;pageAdminReports()" aria-label="${id}">${opts}</select>`;
 admShell(`<h2>Laporan</h2>
 <div class="kpis"><div class="card kpi"><b>${rp(sumR(ap.filter(o=>o.created>=t0.getTime())))}</b><span>Pendapatan hari ini</span></div><div class="card kpi"><b>${rp(sumR(ap.filter(o=>o.created>=wk)))}</b><span>Pendapatan 7 hari</span></div><div class="card kpi"><b>${rp(sumR(ap.filter(o=>o.created>=mo)))}</b><span>Pendapatan bulan ini</span></div><div class="card kpi"><b>${all.length}</b><span>Jumlah order (filter)</span></div><div class="card kpi"><b>${qtyTotal(sold)}</b><span>Produk terjual (filter)</span></div></div>
 <div class="card pad" style="margin-bottom:16px"><h3>Filter</h3><div class="cols" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))"><div><label for="r_from">Dari</label><input id="r_from" type="date" value="${rep.from}" onchange="rep.from=this.value;pageAdminReports()"></div><div><label for="r_to">Sampai</label><input id="r_to" type="date" value="${rep.to}" onchange="rep.to=this.value;pageAdminReports()"></div>
 <div><label for="r_kec">Kecamatan</label>${sel('r_kec',rep.kec,'<option value="">Semua</option>'+db.zones.map(z=>`<option ${rep.kec===z.k?'selected':''}>${esc(z.k)}</option>`).join(''))}</div>
 <div><label for="r_pid">Produk</label>${sel('r_pid',rep.pid,'<option value="">Semua</option>'+db.products.filter(p=>!p.deleted).map(p=>`<option value="${p.id}" ${rep.pid===p.id?'selected':''}>${esc(p.name)}</option>`).join(''))}</div>
 <div><label for="r_status">Status order</label>${sel('r_status',rep.status,'<option value="">Semua</option>'+[...STEPS.map(s=>s[0]),'dibatalkan'].map(s=>`<option ${rep.status===s?'selected':''}>${s}</option>`).join(''))}</div></div>
 <p><button class="btn sm" onclick="exportRep()">Export CSV / Excel</button> <button class="btn sm alt" onclick="try{window.print()}catch(e){toast('Cetak tidak tersedia.')}">Cetak / PDF</button> <button class="btn sm alt" onclick="rep={from:'',to:'',kec:'',pid:'',status:'',per:'harian'};pageAdminReports()">Reset filter</button></p></div>
 <div class="card pad" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h3>Grafik penjualan</h3><select onchange="rep.per=this.value;pageAdminReports()" style="max-width:160px" aria-label="Periode"><option value="harian" ${rep.per==='harian'?'selected':''}>Harian</option><option value="mingguan" ${rep.per==='mingguan'?'selected':''}>Mingguan</option><option value="bulanan" ${rep.per==='bulanan'?'selected':''}>Bulanan</option></select></div>
 ${ser.length?`<svg viewBox="0 0 360 170" width="100%" role="img" aria-label="Grafik penjualan ${rep.per}">${ser.map((x,i)=>{const h=Math.round(x[1].v/mx*110);const X=i*bw+6;return`<rect x="${X}" y="${125-h}" width="${Math.max(bw-8,8)}" height="${h}" fill="var(--brick)" rx="3"/><text x="${X+(bw-8)/2}" y="${120-h}" font-size="8" text-anchor="middle" fill="var(--ink)">${Math.round(x[1].v/1000)}k</text><text x="${X+(bw-8)/2}" y="142" font-size="8" text-anchor="middle" fill="var(--mut)">${esc(x[0])}</text>`}).join('')}</svg>`:'<p>Belum ada penjualan terkonfirmasi pada filter ini.</p>'}</div>
 <div class="cols"><div class="card pad"><h3>Produk terlaris</h3>${barList(sold)}<h3 style="margin-top:14px">Pelanggan terbanyak (nilai belanja)</h3>${barList(cust,rp)}</div><div class="card pad"><h3>Metode pembayaran</h3>${barList(meth)}<h3 style="margin-top:14px">Wilayah pengiriman</h3>${barList(kec)}</div></div>
 <p class="msg">Laporan menghitung pesanan yang sudah dikonfirmasi (stok terpotong) dan tidak dibatalkan. Menampilkan maksimal 500 pesanan terbaru.</p>`,'reports')}
function exportRep(){csvBox('Export laporan',[['no','tanggal','pelanggan','kecamatan','produk','metode','status_bayar','status','total'],...repOrders().map(o=>[o.no,new Date(o.created).toLocaleString('id-ID'),o.name,o.kec,o.items.map(i=>i.name+' x'+i.qty).join('; '),o.method,o.pay,o.status,o.total])])}

/* ============ ROUTER ============ */
function router(){
 if(!READY)return;
 closeModal();
 const raw=(location.hash||'#/').slice(1),[path,q]=raw.split('?'),p=path.split('/').filter(Boolean),u=me();
 if(p[0]==='admin'){
  const pub=['login','forgot-password','reset-password'];
  if(!p[1]){location.hash='#/admin/dashboard';return}
  if(pub.includes(p[1])){if(isAdm(u)&&p[1]==='login'){location.hash='#/admin/dashboard';return}return p[1]==='login'?pageAdminLogin():pageForgot(true)}
  if(!isAdm(u)){if(u)toast('403 Forbidden: akses ditolak.');else toast('Silakan login sebagai admin.');location.hash='#/admin/login';return}
  const m={dashboard:pageDash,orders:pageAdminOrders,products:pageAdminProducts,shipping:pageAdminShipping,vouchers:pageAdminVouchers,payments:pageAdminPayments,settings:pageAdminSettings,admins:pageAdminAdmins,'audit-logs':pageAdminAudit,categories:pageAdminCats,banners:pageAdminBanners,reviews:pageAdminReviews,reports:pageAdminReports,customers:pageAdminAdmins,promotions:pageAdminVouchers};
  const f=m[p[1]]||(['prices','inventory'].includes(p[1])?pageAdminProducts:(['qris','banks'].includes(p[1])?pageAdminPayments:pageDash));return f()}
 if(!p.length)return pageHome();
 switch(p[0]){
  case'produk':return p[1]?pageProduct(p[1]):pageProducts(q);
  case'keranjang':return pageCart();
  case'checkout':return pageCheckout();
  case'login':return u?(location.hash='#/akun'):pageLogin(q);
  case'register':return pageRegister();
  case'forgot-password':case'reset-password':return pageForgot(false);
  case'tracking':return pageTracking(new URLSearchParams(q||'').get('no'));
  case'kontak':return pageContact();
  case'invoice':if(!u){location.hash='#/login';return}return pageInvoice(p[1]);
  case'akun':if(!u){toast('Silakan masuk terlebih dahulu.');location.hash='#/login';return}
   if(p[1]==='pesanan')return p[2]?pageOrder(p[2]):pageOrders();if(p[1]==='pengaturan')return pageSettings();if(p[1]==='alamat')return pageAddr();if(p[1]==='wishlist')return pageWish();return pageAccount();
  default:return pageHome()}}
window.addEventListener('hashchange',router);
try{const i='data:image/svg+xml,'+encodeURIComponent(logo(64).replace('aria-hidden="true"','xmlns="http://www.w3.org/2000/svg"'));const l=document.createElement('link');l.rel='icon';l.href=i;document.head.appendChild(l)}catch(e){}
