(()=> {
"use strict";
const $=id=>document.getElementById(id), DATA=window.BW_DATA;
let allocation={STR:5,VIT:5,INT:5,AGI:5,DEX:5,LUK:5}, points=30, imageData="", game=null, enemy=null, battleGuard=false, steps=0;
const statLabels={STR:"筋力",VIT:"生命",INT:"知力",AGI:"素早さ",DEX:"器用",LUK:"運"};
const mapRows=[
"#########################",
"#....#.............#....#",
"#....#..####.......#....#",
"#.......#..#.......#....#",
"#..N....#..#...##..#....#",
"#.......#......#...#....#",
"###.########...#...#....#",
"#..............#........#",
"#..####........#....##..#",
"#..............#........#",
"#......####.............#",
"#.......................#",
"#..##.............##....#",
"#.......................#",
"#########################"
];
const TILE=32, canvas=$("world"),ctx=canvas.getContext("2d");
const objectives=[{x:3,y:4,label:"避難民に話しかける",sub:"黄色く発光する人物が目印。"}];
function showScreen(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));$(id).classList.add("active")}
function modal(title,html,eyebrow="SYSTEM"){ $("modalTitle").textContent=title;$("modalEyebrow").textContent=eyebrow;$("modalContent").innerHTML=html;$("modal").classList.add("show")}
function closeModal(){$("modal").classList.remove("show")}
$("modalClose").onclick=closeModal;
function renderAllocation(){let root=$("statEditor");root.innerHTML="";Object.keys(allocation).forEach(k=>{let row=document.createElement("div");row.className="stat-row";row.innerHTML=`<b>${k}</b><div class="stat-track"><i style="width:${Math.min(100,allocation[k]*5)}%"></i></div><button data-stat="${k}" data-delta="-1">−</button><span class="stat-val">${allocation[k]}</span><button data-stat="${k}" data-delta="1">＋</button>`;root.appendChild(row)});$("pointsLeft").textContent=points;root.querySelectorAll("button").forEach(b=>b.onclick=()=>{let k=b.dataset.stat,d=Number(b.dataset.delta);if(d>0&&points===0)return;if(d<0&&allocation[k]===5)return;allocation[k]+=d;points-=d;renderAllocation()})}
$("newGameBtn").onclick=()=>{allocation={STR:5,VIT:5,INT:5,AGI:5,DEX:5,LUK:5};points=30;imageData="";$("playerImage").value="";$("avatarPreview").src="";$("avatarFallback").style.display="grid";renderAllocation();showScreen("creatorScreen")};
$("creatorBack").onclick=()=>showScreen("titleScreen");
$("playerImage").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{imageData=r.result;$("avatarPreview").src=imageData;$("avatarFallback").style.display="none"};r.readAsDataURL(f)};
$("startGameBtn").onclick=()=>{if(points>0&&!confirm(`能力値ポイントが${points}残っています。開始しますか？`))return;let name=$("playerName").value.trim()||"名無し";let maxHp=65+allocation.VIT*9,maxMp=20+allocation.INT*6;game={name,image:imageData,stats:{...allocation},level:1,exp:0,sp:0,maxHp,maxMp,hp:maxHp,mp:maxMp,x:5,y:7,skills:[{id:"basic",name:$("initialSkillName").value.trim()||"渾身の一撃",desc:$("initialSkillDesc").value,category:"物理攻撃",attribute:"無",power:1.25,cost:0,equipped:true}],equipped:"basic",items:DATA.items.map(x=>({...x})),story:{talked:false},kills:0};showScreen("gameScreen");updateHUD();drawMap();fieldLog("飢京・中央街区に到着した。霧の向こうに人影が見える。");save()};
$("continueBtn").onclick=load;
$("helpBtn").onclick=()=>modal("操作説明",`<ul><li>移動：WASD / 矢印キー</li><li>調べる：Space / Enter</li><li>スマホ：画面下の方向ボタン</li><li>スキル：SKILLSから使用スキルを装備</li><li>アイテム：ITEMSまたはクイックアイテムから使用</li></ul><div class="notice">目的地はマップ上で金色に点滅します。マーカーに近づいて「調べる」を押してください。</div>`);
function updateHUD(){if(!game)return;$("hudName").textContent=game.name;$("partyName").textContent=game.name;$("hudLevel").textContent=`Lv.${game.level}　EXP ${game.exp}/${needExp()}`;$("hudHp").textContent=`${game.hp}/${game.maxHp}`;$("hudMp").textContent=`${game.mp}/${game.maxMp}`;$("hpMeter").style.width=100*game.hp/game.maxHp+"%";$("mpMeter").style.width=100*game.mp/game.maxMp+"%";["STR","VIT","INT","AGI"].forEach(k=>$("hud"+k[0]+k.slice(1).toLowerCase()).textContent=game.stats[k]);$("potionCount").textContent="×"+(game.items.find(i=>i.id==="potion")?.count||0);$("miniAvatar").innerHTML=game.image?`<img src="${game.image}">`:"◆";$("mapCoords").textContent=`X:${String(game.x).padStart(2,"0")} Y:${String(game.y).padStart(2,"0")}`}
function needExp(){return 25+game.level*20}
function fieldLog(text){let p=document.createElement("p");p.textContent="› "+text;$("fieldLog").prepend(p);while($("fieldLog").children.length>12)$("fieldLog").lastChild.remove()}
function tileAt(x,y){return mapRows[y]?.[x]||"#"}
function isWalk(x,y){return tileAt(x,y)!=="#"}
function drawMap(){if(!game)return;ctx.clearRect(0,0,canvas.width,canvas.height);
 // atmospheric base and street grid
 ctx.fillStyle="#172326";ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<mapRows.length;y++)for(let x=0;x<mapRows[y].length;x++){let t=tileAt(x,y),px=x*TILE,py=y*TILE;
  if(t==="#"){drawBuilding(px,py,x,y)}else{ctx.fillStyle=((x+y)%2)?"#283633":"#303d38";ctx.fillRect(px,py,TILE,TILE);ctx.strokeStyle="#3b4942";ctx.lineWidth=1;ctx.strokeRect(px+.5,py+.5,TILE-1,TILE-1);
   if((x*7+y*13)%17===0){ctx.fillStyle="#536056";ctx.fillRect(px+7,py+8,2,2);ctx.fillRect(px+20,py+22,3,2)}
   if((x+y*3)%19===0){ctx.fillStyle="#4b4840";ctx.fillRect(px+4,py+25,15,3)}
  }}
 // road markings and environmental props
 ctx.strokeStyle="#777b68";ctx.globalAlpha=.25;ctx.setLineDash([9,10]);ctx.beginPath();ctx.moveTo(6*TILE,11*TILE);ctx.lineTo(23*TILE,11*TILE);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
 drawLamp(13*TILE,2*TILE);drawLamp(19*TILE,8*TILE);drawDebris(8*TILE,10*TILE);drawDebris(17*TILE,5*TILE);drawSign(20*TILE,2*TILE);
 // objective route glow
 if(!game.story.talked){let tx=3,ty=4;drawMarker(tx*TILE+16,ty*TILE+12);drawPathHint(game.x,game.y,tx,ty)}
 // NPC
 if(!game.story.talked)drawNPC(3*TILE,4*TILE);
 // player
 drawPlayer(game.x*TILE,game.y*TILE);
}
function drawBuilding(x,y,c,r){ctx.fillStyle="#202a30";ctx.fillRect(x,y,TILE,TILE);ctx.fillStyle="#39464b";ctx.fillRect(x+2,y+2,TILE-4,TILE-4);ctx.fillStyle="#1a2329";ctx.fillRect(x+5,y+6,TILE-10,5);ctx.fillStyle="#58605d";ctx.fillRect(x+5,y+4,TILE-10,2);ctx.fillStyle="#28343a";ctx.fillRect(x+5,y+15,TILE-10,12);if((c+r)%4===0){ctx.fillStyle="#a14d50";ctx.fillRect(x+9,y+17,4,4)}}
function drawLamp(x,y){ctx.fillStyle="#11191b";ctx.fillRect(x+13,y+4,5,23);ctx.fillStyle="#c7a85b";ctx.fillRect(x+8,y+1,15,6);ctx.fillStyle="#e8c96f";ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(x+15,y+10,26,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function drawDebris(x,y){ctx.fillStyle="#5b5044";ctx.fillRect(x+5,y+20,18,5);ctx.fillStyle="#8a7860";ctx.fillRect(x+9,y+15,9,5);ctx.fillStyle="#313a39";ctx.fillRect(x+20,y+23,5,3)}
function drawSign(x,y){ctx.fillStyle="#171b1c";ctx.fillRect(x+2,y+5,27,15);ctx.fillStyle="#a94350";ctx.font="bold 9px sans-serif";ctx.fillText("避難",x+5,y+16)}
function drawNPC(x,y){ctx.fillStyle="#0008";ctx.beginPath();ctx.ellipse(x+16,y+25,13,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#c4ad75";ctx.fillRect(x+9,y+7,14,17);ctx.fillStyle="#ead7a2";ctx.fillRect(x+10,y+3,12,9);ctx.fillStyle="#fff0a1";ctx.globalAlpha=.6+Math.sin(Date.now()/230)*.25;ctx.beginPath();ctx.arc(x+16,y+12,21,0,Math.PI*2);ctx.strokeStyle="#f2d36d";ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1}
function drawMarker(x,y){let pulse=3+Math.sin(Date.now()/180)*2;ctx.fillStyle="#f1d36d22";ctx.beginPath();ctx.arc(x,y,15+pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#f4d36c";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,9+pulse,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#f4d36c";ctx.font="bold 15px sans-serif";ctx.fillText("!",x-4,y-15-pulse)}
function drawPathHint(x,y,tx,ty){let dx=tx-x,dy=ty-y;ctx.strokeStyle="#e9c65c";ctx.globalAlpha=.65;ctx.setLineDash([4,7]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x*TILE+16,y*TILE+16);ctx.lineTo((x+dx*.55)*TILE+16,(y+dy*.55)*TILE+16);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1}
function drawPlayer(x,y){ctx.fillStyle="#05090b99";ctx.beginPath();ctx.ellipse(x+16,y+27,11,4,0,0,Math.PI*2);ctx.fill();if(game.image){let im=new Image();im.onload=()=>ctx.drawImage(im,x+3,y,26,30);im.src=game.image}else{ctx.fillStyle="#d5dce0";ctx.fillRect(x+10,y+5,12,10);ctx.fillStyle="#27303a";ctx.fillRect(x+9,y+14,14,4);ctx.fillStyle="#a44351";ctx.fillRect(x+7,y+18,18,10);ctx.fillStyle="#d4b56b";ctx.fillRect(x+9,y+28,5,3);ctx.fillRect(x+18,y+28,5,3)}}
function animate(){if(game&&$("gameScreen").classList.contains("active"))drawMap();requestAnimationFrame(animate)}requestAnimationFrame(animate);
function move(dx,dy){if(!game||$("modal").classList.contains("show"))return;let nx=game.x+dx,ny=game.y+dy;if(!isWalk(nx,ny))return;game.x=nx;game.y=ny;steps++;updateHUD();if(Math.random()<.075)encounter();if(steps%4===0)save()}
document.addEventListener("keydown",e=>{if(!$("gameScreen").classList.contains("active")||$("modal").classList.contains("show"))return;let key=e.key.toLowerCase(),d={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[key];if(d){e.preventDefault();move(...d)}if(key===" "||key==="enter"){e.preventDefault();interact()}});
document.querySelectorAll("[data-move]").forEach(b=>{let [x,y]=b.dataset.move.split(",").map(Number);b.addEventListener("pointerdown",e=>{e.preventDefault();move(x,y);b._timer=setInterval(()=>move(x,y),190)});["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>clearInterval(b._timer)))});
$("interactBtn").onclick=interact;
function interact(){if(!game)return;if(!game.story.talked&&Math.abs(game.x-3)+Math.abs(game.y-4)<=2){game.story.talked=true;fieldLog("避難民：「この先の路地で、見たことのない生き物が出た。旧行政区から来たという噂だ。」");$("objectiveText").textContent="北側の路地を調査する";$("objectiveSub").textContent="赤黒い痕跡のある場所を探そう。";fieldLog("新しい目的地が記録された。");save()}else if(!game.story.talked){fieldLog("金色に光る人物の近くで調べると会話できる。")}else{fieldLog("周囲を調べた。霧の奥から低いうなり声が聞こえる……。")}}
function encounter(){let pool=DATA.enemies;enemy={...pool[Math.floor(Math.random()*pool.length)],maxHp:0};enemy.maxHp=enemy.hp;startBattle()}
function startBattle(){let glyph=enemy.glyph;modal("魔物との遭遇",`<div class="battle-enemy"><div class="enemy-glyph" style="color:${enemy.color}">${glyph}</div><div class="enemy-name">${enemy.name}</div><div class="skill-meta">${enemy.desc}</div><div class="meter"><i id="enemyMeter" style="width:100%;background:#c65360"></i></div><small id="enemyHpText">HP ${enemy.hp}/${enemy.maxHp}</small></div><div id="battleLog" class="battle-log">${enemy.name}が現れた！</div><div class="battle-actions"><button class="btn primary" id="attackBtn">通常攻撃</button><button class="btn" id="skillBtn">装備スキル</button><button class="btn" id="battleItemBtn">アイテム</button><button class="btn" id="defendBtn">防御</button><button class="btn" id="escapeBtn">逃走</button></div>`,"ENCOUNTER");$("attackBtn").onclick=attack;$("skillBtn").onclick=useEquippedSkill;$("battleItemBtn").onclick=()=>itemChooser(true);$("defendBtn").onclick=defend;$("escapeBtn").onclick=()=>{if(Math.random()<.7){closeModal();fieldLog("戦闘から離脱した。")}else{enemyAttack()}}}
function battleText(t){$("battleLog").textContent=t}
function refreshEnemy(){let pct=Math.max(0,enemy.hp/enemy.maxHp*100);$("enemyMeter").style.width=pct+"%";$("enemyHpText").textContent=`HP ${Math.max(0,enemy.hp)}/${enemy.maxHp}`}
function attack(){let damage=Math.max(2,game.stats.STR+Math.floor(Math.random()*5)-enemy.def);enemy.hp-=damage;refreshEnemy();if(enemy.hp<=0)return victory();battleText(`${damage}ダメージを与えた。`);enemyAttack()}
function useEquippedSkill(){let s=game.skills.find(x=>x.id===game.equipped)||game.skills[0];if(!s){battleText("使用できるスキルがない。");return}if(game.mp<s.cost){battleText("MPが足りない！");return}game.mp-=s.cost;let base=s.category==="魔法攻撃"?game.stats.INT:game.stats.STR;let damage=Math.max(1,Math.floor(base*s.power)-enemy.def);enemy.hp-=damage;refreshEnemy();updateHUD();if(enemy.hp<=0)return victory();battleText(`${s.name}！ ${damage}ダメージ！`);enemyAttack()}
function defend(){battleGuard=true;battleText("身構えた。次の攻撃を軽減する。");enemyAttack()}
function enemyAttack(){let dmg=Math.max(1,enemy.atk-Math.floor(game.stats.VIT/4));if(battleGuard){dmg=Math.ceil(dmg*.35);battleGuard=false}game.hp=Math.max(0,game.hp-dmg);updateHUD();if(game.hp===0){game.hp=Math.ceil(game.maxHp*.5);game.x=5;game.y=7;closeModal();fieldLog("意識を失い、避難地点で目を覚ました。HPが半分まで回復した。");updateHUD();return}battleText(( $("battleLog").textContent+" 敵の反撃！ "+dmg+"ダメージ。").slice(-150))}
function victory(){let exp=enemy.exp;game.exp+=exp;game.kills++;let drop=enemy.drop;let item=game.items.find(i=>i.id==="scrap");if(!item){item={id:"scrap",name:drop,desc:"魔物から得られた素材。",count:0};game.items.push(item)}item.count++;closeModal();fieldLog(`${enemy.name}を撃退！ EXP ${exp}、${drop}を獲得。`);while(game.exp>=needExp()){game.exp-=needExp();game.level++;game.sp+=2;game.maxHp+=7;game.maxMp+=3;game.hp=game.maxHp;game.mp=game.maxMp;fieldLog(`LEVEL UP！ Lv.${game.level}。スキルポイント+2。`)}updateHUD();save()}
function openPanel(type){if(!game)return;if(type==="status")return modal("STATUS",`<h3>${esc(game.name)}　Lv.${game.level}</h3><p>EXP ${game.exp}/${needExp()}　スキルポイント <b style="color:#e6c56d">${game.sp}</b></p><div class="modal-grid">${Object.entries(game.stats).map(([k,v])=>`<div class="data-tile">${k} / ${statLabels[k]}：<b>${v}</b></div>`).join("")}<div class="data-tile">HP：<b>${game.hp}/${game.maxHp}</b></div><div class="data-tile">MP：<b>${game.mp}/${game.maxMp}</b></div></div><p class="muted">撃破数：${game.kills}</p>`);
if(type==="skills")return skillsPanel();if(type==="develop")return developPanel();if(type==="items")return itemChooser(false);if(type==="save")return savePanel()}
function skillsPanel(){let cards=game.skills.map(s=>`<div class="skill-card ${s.id===game.equipped?"selected":""}"><h3>${esc(s.name)} ${s.id===game.equipped?'<span class="pill">装備中</span>':""}</h3><div class="skill-meta">${s.category} / ${s.attribute||"無属性"} / 威力 ${s.power} / MP ${s.cost}</div><div class="muted">${esc(s.desc||"説明なし")}</div><div class="skill-actions"><button class="small-btn ${s.id===game.equipped?"active":""}" data-equip="${s.id}">${s.id===game.equipped?"装備中":"このスキルを装備"}</button></div></div>`).join("");modal("SKILLS",`<p class="muted">戦闘で使用するスキルを選択できます。装備できるスキルは現在1つです。</p>${cards}<button class="btn" id="goDevelop">＋ 新しいスキルを開発</button>`);document.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>{game.equipped=b.dataset.equip;save();skillsPanel();fieldLog(`使用スキルを「${game.skills.find(s=>s.id===game.equipped).name}」に変更した。`)});$("goDevelop").onclick=developPanel}
function developPanel(){modal("SKILL DEVELOPMENT",`<p class="notice">所持スキルポイント：<b>${game.sp}</b>　基本開発コスト：2 SP</p><div class="form-row"><label>技名（自由入力）</label><input id="skillName" maxlength="24" placeholder="例：黒雷穿撃"></div><div class="form-row"><label>カテゴリ</label><select id="skillCategory">${DATA.skillCategories.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="form-row"><label>属性</label><select id="skillAttribute">${DATA.attributes.map(x=>`<option>${x}</option>`).join("")}</select></div><div class="form-row"><label>説明</label><textarea id="skillDesc" maxlength="120" rows="2" placeholder="技の効果や演出"></textarea></div><div class="form-row"><label>威力</label><select id="skillPower"><option value="0.8">軽い（0.8倍）</option><option value="1.2" selected>標準（1.2倍）</option><option value="1.7">強力（1.7倍）</option><option value="2.2">高威力（2.2倍）</option></select></div><div class="form-row"><label>消費MP</label><select id="skillCost"><option>0</option><option>5</option><option>10</option><option>15</option><option>20</option></select></div><button class="btn primary" id="createSkill">スキルを開発する（2 SP）</button><p class="hint">属性・対象・追加効果・発動条件などは今後追加予定。現在は攻撃カテゴリの威力が戦闘に反映されます。</p>`);$("createSkill").onclick=()=>{let name=$("skillName").value.trim();if(!name)return alert("技名を入力してください。");if(game.sp<2)return alert("スキルポイントが足りません。");let s={id:"skill_"+Date.now(),name,category:$("skillCategory").value,attribute:$("skillAttribute").value,desc:$("skillDesc").value,power:Number($("skillPower").value),cost:Number($("skillCost").value)};game.sp-=2;game.skills.push(s);game.equipped=s.id;save();skillsPanel();fieldLog(`新スキル「${name}」を開発し、装備した。`)}}
function itemChooser(inBattle){let cards=game.items.map(i=>`<div class="item-card"><b>${esc(i.name)} × ${i.count}</b><p class="muted">${esc(i.desc||"")}</p><button class="small-btn" data-use="${i.id}" ${i.count<=0?"disabled":""}>使用する</button></div>`).join("");modal("ITEMS",cards||"アイテムを所持していない。");document.querySelectorAll("[data-use]").forEach(b=>b.onclick=()=>useItem(b.dataset.use,inBattle))}
function useItem(id,inBattle){let item=game.items.find(i=>i.id===id);if(!item||item.count<=0)return;if(item.heal){if(game.hp===game.maxHp){alert("HPは満タンです。");return}let before=game.hp;game.hp=Math.min(game.maxHp,game.hp+item.heal);fieldLog(`${item.name}を使用。HPが${game.hp-before}回復した。`)}else if(item.mp){if(game.mp===game.maxMp){alert("MPは満タンです。");return}let before=game.mp;game.mp=Math.min(game.maxMp,game.mp+item.mp);fieldLog(`${item.name}を使用。MPが${game.mp-before}回復した。`)}else{alert("このアイテムはまだ使用できません。");return}item.count--;updateHUD();save();if(inBattle){closeModal();startBattle()}else itemChooser(false)}
$("quickPotion").onclick=()=>useItem("potion",false);
function save(){if(game)localStorage.setItem("bloodworld_v020",JSON.stringify(game))}
function load(){let raw=localStorage.getItem("bloodworld_v020")||localStorage.getItem("bloodworld_save");if(!raw)return alert("セーブデータがありません。");try{game=JSON.parse(raw);if(!game.items)game.items=[];if(!game.skills)game.skills=[];if(!game.equipped&&game.skills[0])game.equipped=game.skills[0].id;showScreen("gameScreen");updateHUD();drawMap();fieldLog("セーブデータを読み込みました。")}catch(e){alert("セーブデータを読み込めませんでした。")}}
function savePanel(){modal("SAVE DATA",`<p>ブラウザ内に保存するか、JSONファイルとしてバックアップできます。</p><button class="btn primary" id="saveNow">このブラウザに保存</button> <button class="btn" id="exportSave">JSONを書き出す</button><div class="form-row"><label>JSONセーブデータを読み込む</label><input id="importSave" type="file" accept=".json,application/json"></div>`);$("saveNow").onclick=()=>{save();alert("保存しました。")};$("exportSave").onclick=()=>{let blob=new Blob([JSON.stringify({version:DATA.version,game},null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="bloodworld-save.json";a.click();URL.revokeObjectURL(a.href)};$("importSave").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);game=d.game||d;save();closeModal();showScreen("gameScreen");updateHUD();drawMap();fieldLog("JSONセーブデータを読み込みました。")}catch(err){alert("読み込めないセーブデータです。")}};r.readAsText(f)}}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelectorAll("[data-panel]").forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));
renderAllocation();
})();