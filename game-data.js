window.BW_DATA = {
  version:"0.3.0",
  skillCategories:["物理攻撃","魔法攻撃","回復","防御","強化","弱体化","状態異常"],
  attributes:["無","炎","水","雷","風","氷","光","闇"],
  effects:["なし","攻撃低下","行動妨害","追加回復"],
  areas:[
    {id:"center",name:"飢京・中央街区",code:"KYOKYO / SECTOR 01",desc:"避難民の証言を手掛かりに、路地の異常を調べる。",spawn:{x:3,y:12},npc:{x:5,y:5},target:{x:21,y:3},next:"residential",nextName:"廃棄住宅街",enemyPool:["stray","crawler","wisp"],eventEnemy:"wisp",
     blocks:[[1,1,5,3],[8,2,4,2],[15,1,3,4],[21,6,2,3],[4,8,4,2],[11,9,4,2],[2,5,1,2],[17,11,3,1]],decor:["lamp","debris"]},
    {id:"residential",name:"飢京・廃棄住宅街",code:"KYOKYO / SECTOR 02",desc:"住民の残した記録と、魔物の巣になった住宅を調べる。",spawn:{x:3,y:12},npc:{x:5,y:4},target:{x:20,y:9},next:"subway",nextName:"地下交通網",enemyPool:["crawler","stray","mimic"],eventEnemy:"brute",
     blocks:[[2,1,4,3],[9,1,3,4],[16,1,5,2],[5,7,4,3],[13,6,3,3],[20,11,3,2],[1,10,2,2]],decor:["debris","lamp"]},
    {id:"subway",name:"飢京・地下交通網",code:"KYOKYO / SECTOR 03",desc:"閉鎖された地下駅で、不自然な反応の発生源を探す。",spawn:{x:3,y:12},npc:{x:5,y:5},target:{x:20,y:3},next:"admin",nextName:"旧行政区",enemyPool:["wisp","mimic","crawler"],eventEnemy:"mimic",
     blocks:[[1,1,3,3],[7,1,5,2],[16,1,3,3],[5,7,4,2],[12,6,5,2],[20,8,3,4],[1,11,3,1]],decor:["lamp"]},
    {id:"admin",name:"飢京・旧行政区",code:"KYOKYO / SECTOR 04",desc:"旧行政区の封鎖区画で、魔物発生に関する決定的な証拠を探す。",spawn:{x:3,y:12},npc:{x:5,y:4},target:{x:20,y:8},next:null,nextName:null,enemyPool:["brute","wisp","mimic"],eventEnemy:"adminBoss",
     blocks:[[1,1,5,3],[8,1,4,3],[15,1,5,3],[3,7,4,3],[10,7,4,2],[18,11,4,2],[1,11,2,2]],decor:["debris","lamp"]}
  ],
  enemies:[
    {id:"stray",name:"路地の異形",glyph:"☠",hp:32,atk:8,def:1,exp:15,drop:"錆びた欠片",color:"#c6d0c9",desc:"路地裏を徘徊する小型の魔物。"},
    {id:"crawler",name:"這いずる屍獣",glyph:"♟",hp:46,atk:10,def:2,exp:21,drop:"変異した皮膜",color:"#9bbb8b",desc:"地面を這い、足元へ噛みつく。"},
    {id:"wisp",name:"赤霧の浮遊体",glyph:"◉",hp:30,atk:13,def:0,exp:23,drop:"赤霧の結晶",color:"#e76a75",desc:"赤い霧をまとった不安定な魔物。"},
    {id:"brute",name:"廃材喰らい",glyph:"♜",hp:74,atk:12,def:4,exp:32,drop:"硬質な外殻",color:"#c49b72",desc:"廃材を取り込み、外殻を硬化させた大型種。"},
    {id:"mimic",name:"擬態する影",glyph:"✥",hp:43,atk:16,def:1,exp:30,drop:"黒い核片",color:"#b28bd0",desc:"物陰に潜み、隙を見て襲いかかる。"},
    {id:"adminBoss",name:"封鎖区画の番人",glyph:"⛧",hp:125,atk:18,def:5,exp:85,drop:"異常反応の記録媒体",color:"#e56a70",desc:"旧行政区の奥で発見された大型個体。"}
  ],
  items:[
    {id:"potion",name:"応急薬",desc:"HPを50回復する。",heal:50,count:4},
    {id:"ether",name:"簡易補助剤",desc:"MPを25回復する。",mp:25,count:2}
  ]
};