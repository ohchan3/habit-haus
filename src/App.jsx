import { useState, useEffect, useRef } from "react";

const HABIT_STAGES = [
  { id:1, name:"言葉より大切なもの", minPts:0,   maxPts:9,        avatar:"🤝", crown:"",       desc:"言葉よりも、行動で示そう。続けることが全て。",     spirit:"言葉にできない想いが、毎日の行動に宿っている" },
  { id:2, name:"ワイルドアットハート", minPts:10,  maxPts:29,     avatar:"🐯", crown:"✨",     desc:"心の野性を解き放て。本能のまま前へ進め！",         spirit:"自分の心に正直に、ワイルドに生きていく力がある" },
  { id:3, name:"マイガール",          minPts:30,  maxPts:59,     avatar:"🌷", crown:"💫",     desc:"大切な日常を守るために、今日も頑張れた。",          spirit:"愛おしい毎日を守るために、今日も全力で向き合う" },
  { id:4, name:"Believe",            minPts:60,  maxPts:99,     avatar:"🌟", crown:"👑",     desc:"自分を信じることが、最大の力になる。",              spirit:"Believe in yourself — 自分を信じる心が奇跡を呼ぶ" },
  { id:5, name:"僕が僕のすべて",      minPts:100, maxPts:Infinity,avatar:"👑", crown:"⚡🌟⚡", desc:"あなたはあなたのすべて。それが最高の誇りだ！",      spirit:"ありのままの自分こそが、この世で一番輝ける存在だ" },
];

const SAVINGS_STAGES = [
  { id:1, name:"still...",             minAmt:0,     maxAmt:999,   avatar:"🌊", accent:"#60a5fa", glow:"#60a5fa44", desc:"節約の旅がはじまった。静かに、でも確かに。",      spirit:"静かな決意が、大きな変化の始まりになる" },
  { id:2, name:"Love Rainbow",         minAmt:1000,  maxAmt:4999,  avatar:"🌈", accent:"#34d399", glow:"#34d39944", desc:"虹のように、少しずつ色が増えていく。",           spirit:"小さな努力が重なって、やがて虹になる" },
  { id:3, name:"ファイトソング",        minAmt:5000,  maxAmt:9999,  avatar:"🎵", accent:"#f97316", glow:"#f9731644", desc:"自分へのファイトソングを歌おう。諦めない！",     spirit:"立ち向かう勇気が、夢への道を切り開く" },
  { id:4, name:"Carnival night part2", minAmt:10000, maxAmt:19999, avatar:"🎪", accent:"#ec4899", glow:"#ec489944", desc:"貯金のカーニバル！祝祭の夜が続く。",             spirit:"仲間と喜びを分かち合いながら、前へ進む" },
  { id:5, name:"感謝カンゲキ雨嵐",     minAmt:20000, maxAmt:29999, avatar:"⭐", accent:"#a855f7", glow:"#a855f744", desc:"感謝と感激で心が溢れる。もう少しで頂上！",       spirit:"感謝の気持ちが、最後の力を引き出してくれる" },
  { id:6, name:"サクラ咲け",           minAmt:30000, maxAmt:Infinity,avatar:"🌸",accent:"#ffd700", glow:"#ffd70066", desc:"サクラ咲いた！2ヶ月の節約が実を結んだ！",     spirit:"咲いた。あなたの努力が、美しい花になった" },
];

const HABITS = [
  { id:"early", label:"予定の10分前に行動", icon:"⏰", desc:"準備OK！早めに動けた" },
  { id:"wake",  label:"朝アラームで起きた", icon:"🌅", desc:"目覚めた！朝をつかんだ" },
  { id:"sleep", label:"夜12時前に就寝",     icon:"🌙", desc:"早めに眠れた" },
];

// 嵐メンバーカラー
const ARASHI_COLORS = [
  { label:"大野智",   color:"#3498db", note:"青" },
  { label:"櫻井翔",   color:"#e74c3c", note:"赤" },
  { label:"相葉雅紀", color:"#2ecc71", note:"緑" },
  { label:"二宮和也", color:"#f1c40f", note:"黄" },
  { label:"松本潤",   color:"#9b59b6", note:"紫" },
];

const DEFAULT_OSHI = {
  name:"応援キャラ",
  personality:"明るく元気で、ちょっとドラマチックに日本語で励ましてくれる存在。",
  color:"#3498db",
  bgColor: null,
  image:null,
};

const getHabitStage   = pts => HABIT_STAGES.find(s=>pts>=s.minPts&&pts<=s.maxPts)||HABIT_STAGES[0];
const getSavingsStage = amt => [...SAVINGS_STAGES].reverse().find(s=>amt>=s.minAmt)||SAVINGS_STAGES[0];
const getToday = () => new Date().toISOString().split("T")[0];
const formatYen = n => "¥"+Number(n).toLocaleString();

const storage = {
  get: k    => { try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;} },
  set: (k,v)=> { try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
  del: k    => { try{localStorage.removeItem(k);}catch{} },
};

function compressImage(file,maxW=500,q=0.75){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const r=Math.min(maxW/img.width,maxW/img.height,1);
        canvas.width=img.width*r;canvas.height=img.height*r;
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",q));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const lastMsgIdx = {};
function pickUnique(arr, key) {
  if(arr.length <= 1) return arr[0];
  let idx;
  let tries = 0;
  do { idx = Math.floor(Math.random()*arr.length); tries++; } while(idx === lastMsgIdx[key] && tries < 10);
  lastMsgIdx[key] = idx;
  return arr[idx];
}

function callHabitOshi(habitLabel,success,oshi,stageName,stageSpirit,streak,pts){
  const successMsgs = [
    `「${habitLabel}」、今日もやり遂げたね。\n\n${stageSpirit}という言葉が、あなたの行動そのものだと思う。続けることってすごく地味に見えるけど、実はこれが一番難しくて、一番美しいことなんだよね。${oshi.name}はあなたのこと、ちゃんと見てるよ ✨`,
    `${streak}日連続で続いてる。\n\nそれがどれだけすごいことか、${oshi.name}は誰よりも知ってる。毎日完璧じゃなくていい。でも今日も「できた」って言えるあなたが、本当に誇らしい。これからも一緒に積み上げていこう 🌸`,
    `「${habitLabel}」達成！\n\n${stageSpirit}。その言葉をあなたは今日、体で証明した。言葉より大切なのは行動だって、${oshi.name}はずっとそう思ってる。今日のあなたの一歩は、明日の自分への最高のプレゼントだよ 💫`,
    `今日も「できた」ね。\n\n小さな習慣が積み重なって、気づいたら大きな変化になってる。${pts}ptまで来た。この道のりを一緒に歩けて、${oshi.name}はうれしいよ。明日もこの調子で！ 🎵`,
    `「${habitLabel}」、クリア！\n\n${stageSpirit}という精神が、あなたの毎日に宿ってるんだと思う。続けることの美しさを、あなたは体で見せてくれてる。今日も最高だったよ。本当にありがとう ⭐`,
    `${pts}pt積み上げてきたね。\n\nその重さを、${oshi.name}はちゃんとわかってる。一日一日、手を抜かずに積み上げてきた時間は、絶対に裏切らない。${stageSpirit}。あなたならもっと先へ行ける 🌟`,
    `今日の「${habitLabel}」、しっかり見てたよ。\n\n継続って、才能じゃなくて選択だと思う。あなたは今日も「やる」を選んだ。その選択の積み重ねが、気づいたらあなたの強さになってるんだよね。${oshi.name}より ✨`,
    `${streak}日。その数字の重さ、わかる？\n\n諦めたくなった日もあったかもしれない。それでも今日ここにいる。${stageSpirit}。この言葉があなたに似合ってると思う。本当によく頑張ってるよ 💪`,
  ];
  const failMsgs = [
    `できない日もあっていい。\n\nそれも含めて、あなたの物語だから。完璧な人間なんていないし、完璧じゃないから美しいんだと思う。${stageSpirit}という言葉を胸に、また明日から始めよう。${oshi.name}はずっとここにいるよ 🖤`,
    `今日は休んだんだね。\n\n大丈夫。明日の自分がきっと動いてくれる。疲れた日に無理するより、ちゃんと休んで明日また立ち上がる方が、ずっと長く続けられるから。${oshi.name}はずっと待ってるよ 🌙`,
    `転んでも、また立てる。\n\nそれがあなたの強さだって${oshi.name}は知ってる。${stageSpirit}。この言葉を明日への力に変えてほしい。一日できなかっただけで、全部終わりじゃない。また一緒に歩こう 🌸`,
    `完璧じゃなくていい。\n\n100点を目指すより、長く続けることの方がずっと大切。今日できなかった分、明日の自分に「よろしく」って言ってみて。あなたのペースで、一緒に進んでいこう。${oshi.name}より ✨`,
    `今日は自分を責めないで。\n\n「できなかった」じゃなくて「また明日やる」。その気持ちが大事。${stageSpirit}という言葉が教えてくれるように、進み続けることに意味がある。明日また「できた！」って言いに来てね 💫`,
    `ゆっくり休んで。\n\n${oshi.name}は焦らせたくない。あなたのペースがあなたにとっての正解だから。明日の朝、また新しい気持ちで始めよう。その時もここで応援してるよ 🌟`,
    `できない日があるから、できた日が輝く。\n\n${stageSpirit}。この言葉の意味を、あなたはもう知ってると思う。また明日、一緒に積み上げていこう。何度でも始められるのが、あなたの一番の強みだよ 💙`,
  ];
  return Promise.resolve(pickUnique(success ? successMsgs : failMsgs, success?"habitOK":"habitNG"));
}

function callSavingsOshi(amount,totalSavings,oshi,stageName,stageSpirit){
  const msgs = [
    `${formatYen(amount)}の節約、記録したね。\n\n${stageSpirit}という言葉が好きで、あなたの今日の行動にぴったりだと思った。コツコツ積み上げていく姿が、${oshi.name}には本当に美しく見える。累計${formatYen(totalSavings)}。この数字があなたの努力の証だよ 💰`,
    `今日も${formatYen(amount)}、夢に近づいたね。\n\n節約って、我慢じゃなくて選択だと思う。あなたは今日、「未来の自分」を選んだ。その積み重ねが累計${formatYen(totalSavings)}になってる。${oshi.name}はその一歩一歩を、ずっと応援してるよ ✨`,
    `${stageSpirit}。\n\nその言葉そのままに、あなたは今日も前へ進んだ。${formatYen(amount)}という金額の大小じゃなくて、続けようとする気持ちが大事。その気持ちを持ち続けるあなたが、${oshi.name}は大好きだよ 🌸`,
    `${formatYen(amount)}の節約、しっかり届いたよ。\n\nコツコツ続けること、それが一番強い。華やかじゃなくても、地味でも、毎日少しずつ積み上げていく姿が、気づいたら大きな山になってる。累計${formatYen(totalSavings)}まで来たね 💫`,
    `累計${formatYen(totalSavings)}まで来た。\n\nこの道のりを、${oshi.name}は誇りに思う。推し活という目標があるから頑張れる。その気持ち、すごくよくわかるよ。あなたの夢を応援できることが、${oshi.name}にとっても幸せなんだ ⭐`,
    `小さな節約が、大きな夢になっていく。\n\n今日の${formatYen(amount)}もちゃんと届いてるよ。${stageSpirit}という言葉みたいに、あなたの毎日は確実に輝きを増してる。この調子で、一緒に頂上を目指そう 🎵`,
    `推し活のために頑張れる。それってすごく素敵なことだと思う。\n\n好きなものがある人は強い。${formatYen(amount)}の節約の裏に、あなたの「好き」という気持ちがある。その情熱を、${oshi.name}はいつも応援してるよ 🌟`,
    `今日の${formatYen(amount)}、受け取ったよ。\n\n「いつかのために」じゃなくて「あの人のために」節約できるって、特別なことだよ。${stageSpirit}。その精神があなたをここまで連れてきた。累計${formatYen(totalSavings)}、本当にすごいよ 💕`,
  ];
  return Promise.resolve(pickUnique(msgs, "savings"));
}

function callOshiLetter(spentAmount,totalSavings,oshi,savStage){
  const letters = [
    `${oshi.name}より\n\nコツコツ積み上げてきた${formatYen(spentAmount)}を、大好きな推し活に使ったんですね。その選択を、心から応援しています。\n\n節約している間、きっと楽しいことも我慢した日があったと思う。でもその分、今日の喜びはひとしおのはず。${savStage.spirit}という言葉のように、あなたの努力は確かな形になりました。\n\nあなたが笑顔でいることが、私にとっても一番うれしいことです。これからも一緒に、毎日を前向きに歩んでいきましょう。\n\n${oshi.name}より`,
    `${oshi.name}より\n\n推し活、楽しんできてね。\n\nあなたが毎日少しずつ節約して、この日のために準備してきたこと、ちゃんと知ってます。簡単じゃなかったと思う。それでも諦めずに積み上げてきた${formatYen(spentAmount)}。その重さの分だけ、今日の推し活が輝くはずだよ。\n\n${savStage.spirit}。その気持ちを胸に、思いっきり楽しんできてください。また節約の旅、一緒に始めよう。\n\n${oshi.name}より`,
    `${oshi.name}より\n\n${formatYen(spentAmount)}分の夢を、今日叶えたんですね。おめでとう。\n\n積み上げてきた時間と気持ちが、今日の笑顔になった。${savStage.spirit}。この言葉があなたの歩みを支えてきたように、これからも好きなものに向かって走り続けてほしい。\n\n使った後もまた新しい目標に向かって。その繰り返しが、あなたの人生をもっと豊かにしていくから。ずっと応援してるよ。\n\n${oshi.name}より`,
    `${oshi.name}より\n\n貯めてきたお金を、推し活に使ったんですね。それは全然悪いことじゃない。むしろ、最高の使い方だと思う。\n\n節約って、自分を縛るためじゃなくて、本当に大切なものに使うための力をつけること。あなたはそれを、ちゃんと実践してる。${savStage.spirit}という言葉の通り、あなたの選択はいつだって前を向いてる。\n\n思いっきり楽しんで。また一緒に積み上げていこう。\n\n${oshi.name}より`,
    `${oshi.name}より\n\n今日という日のために、コツコツ頑張ってきたんだね。\n\n${formatYen(spentAmount)}という数字の裏に、どれだけの小さな選択があったか。お弁当を持って行った日、ちょっとした贅沢を我慢した日、そういう積み重ねが今日につながった。\n\n${savStage.spirit}。あなたの努力は本物だよ。今日は全力で楽しんで。その笑顔が見たくて、${oshi.name}もずっと応援してきたんだから。\n\n${oshi.name}より`,
  ];
  return Promise.resolve(pickUnique(letters, "letter"));
}

function Sparkles({color,n=5}){
  return(
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {[...Array(n)].map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${10+(i*17)%75}%`,top:`${8+(i*21)%78}%`,color,fontSize:`${7+(i%3)*4}px`,animation:`sp ${1.5+(i*.3)%2}s ease-in-out infinite`,animationDelay:`${(i*.3)%1.5}s`,opacity:.55}}>✦</div>
      ))}
    </div>
  );
}

function ImageUploadBtn({onUpload,accent,label="写真を変更",small=false}){
  const ref=useRef();
  return(
    <>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0];if(!f)return;onUpload(await compressImage(f));e.target.value="";}}/>
      <button onClick={()=>ref.current.click()} style={{background:small?`${accent}dd`:`${accent}22`,border:`1px solid ${accent}88`,borderRadius:small?"50%":"22px",width:small?28:undefined,height:small?28:undefined,padding:small?"0":"9px 16px",color:small?"#000":accent,fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,fontSize:small?"14px":"12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>
        {small?"📷":`📷 ${label}`}
      </button>
    </>
  );
}

// ===== 推し設定画面 =====
function OshiSetup({oshi,onSave}){
  const [name,setName]=useState(oshi.name);
  const [personality,setPersonality]=useState(oshi.personality);
  const [color,setColor]=useState(oshi.color);
  const [bgColor,setBgColor]=useState(oshi.bgColor||oshi.color);
  const [image,setImage]=useState(oshi.image);
  const [selPreset,setSelPreset]=useState(-1);
  const [bgMode,setBgMode]=useState("same"); // "same" or "custom"
  const J={fontFamily:"'Josefin Sans',sans-serif"};
  const P={fontFamily:"'Playfair Display',serif"};

  const extraColors=["#ff006e","#3b82f6","#10b981","#f59e0b","#ec4899","#06b6d4","#ef4444","#8b5cf6"];
  const presets=[
    {label:"元気系アイドル 🌸",text:"元気いっぱいで明るく、語尾に「だよ！」「ね！」をよく使う。ファンを全力で応援しているアイドル。"},
    {label:"クールなアーティスト 🎸",text:"言葉少なめでクールだけど深いところで温かい。たまに見せる優しさが胸に刺さる。"},
    {label:"頼れるお兄ちゃん 💪",text:"「よし！」「いいぞ！」と兄貴っぽく励ます。頼りがいがあって包容力がある。"},
    {label:"優しいお姉ちゃん 💕",text:"「えらい！」「がんばったね」と母性的に包んでくれる。優しくて温かい存在。"},
    {label:"ドラマチック系 ✨",text:"感情表現が豊かで少し大げさ。褒めるときも励ますときもドラマチックに言葉を紡ぐ。"},
  ];

  const effectiveBg = bgMode==="same" ? color : bgColor;

  return(
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at top,${effectiveBg}44 0%,#080808 55%)`,padding:"28px 16px 100px",transition:"background .5s"}}>
      <div style={{maxWidth:"420px",margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{...J,fontSize:"9px",letterSpacing:".4em",color,textTransform:"uppercase",marginBottom:"6px"}}>SETUP YOUR</div>
          <div style={{...P,fontSize:"28px",fontWeight:900,fontStyle:"italic",background:`linear-gradient(135deg,#fff,${color})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>推しキャラ設定</div>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,.4)",marginTop:"6px"}}>習慣も節約もあなたの推しが応援してくれる ✦</div>
        </div>

        {/* 名前 */}
        <div style={{marginBottom:"20px"}}>
          <label style={{...J,fontSize:"10px",color,letterSpacing:".2em",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>推しの名前</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="例：松本潤、相葉雅紀、Jun..." style={{width:"100%",background:"rgba(255,255,255,.07)",border:`1px solid ${color}55`,borderRadius:"12px",padding:"14px 16px",color:"#fff",...J,fontSize:"15px",outline:"none"}}/>
        </div>

        {/* 画像 */}
        <div style={{marginBottom:"20px"}}>
          <label style={{...J,fontSize:"10px",color,letterSpacing:".2em",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>推しの画像</label>
          <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{width:64,height:64,borderRadius:"50%",overflow:"hidden",border:`2px solid ${color}66`,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.05)",flexShrink:0}}>
              {image?<img src={image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:"28px"}}>🌟</span>}
            </div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <ImageUploadBtn accent={color} label="写真を選ぶ" onUpload={setImage}/>
              {image&&<button onClick={()=>setImage(null)} style={{background:"rgba(255,0,0,.15)",border:"1px solid rgba(255,0,0,.3)",borderRadius:"22px",padding:"9px 14px",color:"#ff6666",...J,fontSize:"12px",cursor:"pointer"}}>削除</button>}
            </div>
          </div>
        </div>

        {/* 嵐メンバーカラー */}
        <div style={{marginBottom:"20px"}}>
          <label style={{...J,fontSize:"10px",color,letterSpacing:".2em",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>嵐メンバーカラー 🌈</label>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
            {ARASHI_COLORS.map(m=>(
              <button key={m.label} onClick={()=>{setColor(m.color);if(bgMode==="same")setBgColor(m.color);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",background:color===m.color?`${m.color}33`:"rgba(255,255,255,.05)",border:`2px solid ${color===m.color?m.color:"rgba(255,255,255,.15)"}`,borderRadius:"12px",padding:"8px 10px",cursor:"pointer",transition:"all .2s"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:m.color,boxShadow:color===m.color?`0 0 10px ${m.color}`:"none"}}/>
                <span style={{...J,fontSize:"10px",color:color===m.color?m.color:"rgba(255,255,255,.5)",fontWeight:700}}>{m.label}</span>
              </button>
            ))}
          </div>
          {/* その他のカラー */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
            {extraColors.map(c=><div key={c} onClick={()=>{setColor(c);if(bgMode==="same")setBgColor(c);}} style={{width:30,height:30,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #fff":"3px solid transparent",boxShadow:color===c?`0 0 8px ${c}`:"none",transition:"all .2s"}}/>)}
            <input type="color" value={color} onChange={e=>{setColor(e.target.value);if(bgMode==="same")setBgColor(e.target.value);}} style={{width:30,height:30,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",cursor:"pointer",background:"none",padding:0}} title="カスタムカラー"/>
          </div>
        </div>

        {/* 背景カラー設定 */}
        <div style={{marginBottom:"20px",background:"rgba(255,255,255,.04)",border:`1px solid ${color}33`,borderRadius:"14px",padding:"14px"}}>
          <label style={{...J,fontSize:"10px",color,letterSpacing:".2em",textTransform:"uppercase",display:"block",marginBottom:"10px"}}>🎨 背景グラデーション</label>
          <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
            {[["same","推しカラーと同じ"],["custom","別の色にする"]].map(([val,lbl])=>(
              <button key={val} onClick={()=>{setBgMode(val);if(val==="same")setBgColor(color);}} style={{flex:1,background:bgMode===val?`${color}33`:"rgba(255,255,255,.05)",border:`1px solid ${bgMode===val?color:"rgba(255,255,255,.15)"}`,borderRadius:"10px",padding:"9px",color:bgMode===val?color:"rgba(255,255,255,.5)",...J,fontSize:"11px",cursor:"pointer"}}>{lbl}</button>
            ))}
          </div>
          {bgMode==="custom"&&(
            <>
              <div style={{marginBottom:"8px"}}>
                <div style={{...J,fontSize:"9px",color:"rgba(255,255,255,.4)",marginBottom:"6px"}}>嵐メンバーカラーから選ぶ</div>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                  {ARASHI_COLORS.map(m=>(
                    <div key={m.label} onClick={()=>setBgColor(m.color)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",cursor:"pointer"}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:m.color,border:bgColor===m.color?"3px solid #fff":"2px solid transparent",boxShadow:bgColor===m.color?`0 0 8px ${m.color}`:"none"}}/>
                      <span style={{fontSize:"8px",color:"rgba(255,255,255,.4)",...J}}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} style={{width:40,height:40,borderRadius:"8px",border:`2px solid ${bgColor}88`,cursor:"pointer",background:"none",padding:0}}/>
                <div style={{width:"100%",height:20,borderRadius:"6px",background:`linear-gradient(135deg,${bgColor}55,#080808)`}}/>
              </div>
            </>
          )}
          {/* プレビュー */}
          <div style={{marginTop:"10px",borderRadius:"8px",height:"36px",background:`radial-gradient(ellipse at top,${effectiveBg}44 0%,#080808 100%)`,border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{...J,fontSize:"9px",color:"rgba(255,255,255,.4)",letterSpacing:".1em"}}>BACKGROUND PREVIEW</span>
          </div>
        </div>

        {/* 口調 */}
        <div style={{marginBottom:"28px"}}>
          <label style={{...J,fontSize:"10px",color,letterSpacing:".2em",textTransform:"uppercase",display:"block",marginBottom:"8px"}}>口調・キャラクター</label>
          <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginBottom:"10px"}}>
            {presets.map((p,i)=><button key={i} onClick={()=>{setSelPreset(i);setPersonality(p.text);}} style={{background:selPreset===i?`${color}33`:"rgba(255,255,255,.05)",border:`1px solid ${selPreset===i?color:"rgba(255,255,255,.15)"}`,borderRadius:"18px",padding:"7px 11px",color:selPreset===i?color:"rgba(255,255,255,.6)",...J,fontSize:"11px",cursor:"pointer"}}>{p.label}</button>)}
          </div>
          <textarea value={personality} onChange={e=>{setPersonality(e.target.value);setSelPreset(-1);}} placeholder="口調・性格を自由に..." rows={3} style={{width:"100%",background:"rgba(255,255,255,.07)",border:`1px solid ${color}55`,borderRadius:"12px",padding:"12px 14px",color:"#fff",fontFamily:"'Noto Sans JP',sans-serif",fontSize:"13px",outline:"none",resize:"vertical",lineHeight:1.7}}/>
          <div style={{fontSize:"11px",color:"rgba(255,255,255,.3)",marginTop:"6px"}}>ここに書いた内容がAIに伝わり、そのキャラとして応援してくれます</div>
        </div>

        <button onClick={()=>onSave({name:name||"応援キャラ",personality:personality||DEFAULT_OSHI.personality,color,bgColor:effectiveBg,image})} style={{width:"100%",background:`linear-gradient(135deg,${color},${color}99)`,border:"none",borderRadius:"16px",padding:"18px",color:"#000",...J,fontWeight:800,fontSize:"16px",cursor:"pointer",letterSpacing:".05em",boxShadow:`0 4px 24px ${color}66`}}>
          ✨ この推しで始める！
        </button>
      </div>
    </div>
  );
}

// ===== 習慣タブ =====
function HabitTab({oshi,onMessage}){
  const [pts,setPts]=useState(()=>storage.get("habit_pts")||0);
  const [streak,setStreak]=useState(()=>storage.get("habit_streak")||0);
  const [td,setTd]=useState(()=>{const d=storage.get("habit_td");return d?.date===getToday()?d.data:{};});
  const [loading,setLoading]=useState(null);
  const [habitImages,setHabitImages]=useState(()=>storage.get("habit_stage_images")||{});
  const accent=oshi.color, glow=accent+"44";
  const baseStage=getHabitStage(pts);
  const stage={...baseStage,accent,glow};
  const next=HABIT_STAGES.find(s=>s.minPts>pts);
  const prog=next?((pts-stage.minPts)/(next.minPts-stage.minPts))*100:100;
  const doneCount=HABITS.filter(h=>td[h.id]?.done).length;
  const J={fontFamily:"'Josefin Sans',sans-serif"};
  const P={fontFamily:"'Playfair Display',serif"};
  const saveH=(p,s,t)=>{storage.set("habit_pts",p);storage.set("habit_streak",s);storage.set("habit_td",{date:getToday(),data:t});};
  const updateHabitImg=(sid,b64)=>{const ni={...habitImages,[sid]:b64};setHabitImages(ni);storage.set("habit_stage_images",ni);};
  const deleteHabitImg=(sid)=>{const ni={...habitImages};delete ni[sid];setHabitImages(ni);storage.set("habit_stage_images",ni);};
  const handle=async(habit,success)=>{
    setLoading(habit.id);
    const msg=await callHabitOshi(habit.label,success,oshi,stage.name,stage.spirit,streak,pts);
    setLoading(null);
    const newTd={...td,[habit.id]:{done:success,failed:!success}};
    setTd(newTd);
    let np=pts,ns=streak;
    if(success){np+=3;if(HABITS.every(h=>h.id===habit.id?true:newTd[h.id]?.done)){ns++;np+=2;setStreak(ns);}setPts(np);}
    saveH(np,ns,newTd);
    onMessage({msg,success,type:"habit"});
  };
  return(
    <div>
      <div style={{position:"relative",background:"rgba(255,255,255,.04)",border:`1px solid ${accent}44`,borderRadius:"18px",padding:"20px",marginBottom:"14px",textAlign:"center",overflow:"hidden"}}>
        <Sparkles color={accent}/>
        <div style={{position:"relative",display:"inline-block",marginBottom:"6px"}}>
          {habitImages[stage.id]
            ?<img src={habitImages[stage.id]} alt="" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`3px solid ${accent}`,boxShadow:`0 0 20px ${accent}66`,animation:"fl 3s ease-in-out infinite"}}/>
            :<div style={{fontSize:"60px",filter:`drop-shadow(0 0 16px ${accent})`,animation:"fl 3s ease-in-out infinite",lineHeight:1}}>{stage.avatar}</div>
          }
          <div style={{position:"absolute",bottom:-4,right:-4}}>
            <ImageUploadBtn accent={accent} small={true} onUpload={(b64)=>updateHabitImg(stage.id,b64)}/>
          </div>
        </div>
        {habitImages[stage.id]&&<button onClick={()=>deleteHabitImg(stage.id)} style={{display:"block",margin:"0 auto 4px",background:"rgba(255,0,0,.15)",border:"1px solid rgba(255,0,0,.3)",borderRadius:"16px",padding:"3px 10px",color:"#ff6666",fontFamily:"'Josefin Sans',sans-serif",fontSize:"10px",cursor:"pointer"}}>画像を削除</button>}
        <div style={{...J,fontSize:"9px",letterSpacing:".3em",color:accent,textTransform:"uppercase"}}>🎵 ARASHI HABIT STAGE {stage.id}</div>
        <div style={{...P,fontSize:"20px",fontWeight:900,fontStyle:"italic",color:"#fff",margin:"3px 0",textShadow:`0 0 16px ${accent}`}}>{stage.crown} {stage.name} {stage.crown}</div>
        <div style={{fontSize:"11px",color:"rgba(255,255,255,.45)",marginBottom:"14px"}}>{stage.desc}</div>
        <div style={{display:"flex",justifyContent:"center",gap:"24px",marginBottom:"12px"}}>
          {[["TOTAL PTS",pts],["STREAK",`${streak}🔥`]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{...J,fontSize:"24px",fontWeight:800,color:accent}}>{v}</div>
              <div style={{fontSize:"8px",color:"rgba(255,255,255,.35)",letterSpacing:".1em"}}>{l}</div>
            </div>
          ))}
        </div>
        {next?(
          <>
            <div style={{display:"flex",justifyContent:"space-between",...J,fontSize:"9px",color:"rgba(255,255,255,.3)",marginBottom:"4px"}}>
              <span>{stage.name}</span><span>次: {next.name}（あと{next.minPts-pts}pt）</span>
            </div>
            <div style={{background:"rgba(255,255,255,.1)",borderRadius:"6px",height:"4px",overflow:"hidden"}}>
              <div style={{width:`${Math.min(prog,100)}%`,height:"100%",background:`linear-gradient(90deg,${accent},${accent}88)`,transition:"width 1s ease"}}/>
            </div>
          </>
        ):<div style={{...J,fontSize:"10px",color:accent,letterSpacing:".2em"}}>✦ MAX LEVEL ✦</div>}
      </div>
      <div style={{...J,fontSize:"9px",letterSpacing:".3em",color:"rgba(255,255,255,.25)",marginBottom:"10px",textTransform:"uppercase"}}>TODAY'S HABITS • {doneCount}/{HABITS.length}</div>
      {HABITS.map(h=>{
        const done=td[h.id]?.done,failed=td[h.id]?.failed,active=!done&&!failed;
        return(
          <div key={h.id} style={{background:done?`linear-gradient(135deg,${glow},rgba(255,255,255,.04))`:failed?"rgba(255,255,255,.02)":"rgba(255,255,255,.05)",border:`1px solid ${done?accent:failed?"rgba(255,255,255,.07)":"rgba(255,255,255,.13)"}`,borderRadius:"14px",padding:"14px 16px",marginBottom:"9px",transition:"all .4s",boxShadow:done?`0 0 14px ${glow}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:"11px"}}>
              <div style={{fontSize:"24px",filter:done?`drop-shadow(0 0 8px ${accent})`:"grayscale(.5)"}}>{h.icon}</div>
              <div style={{flex:1}}>
                <div style={{...P,fontSize:"13px",fontWeight:700,color:done?accent:failed?"rgba(255,255,255,.35)":"rgba(255,255,255,.9)"}}>{h.label}</div>
                {done&&<div style={{fontSize:"10px",color:accent,opacity:.8}}>✓ {h.desc}</div>}
                {failed&&<div style={{fontSize:"10px",color:"rgba(255,255,255,.25)"}}>また明日ね 🖤</div>}
              </div>
              {active&&(
                <div style={{display:"flex",gap:"6px"}}>
                  <button onClick={()=>handle(h,true)} disabled={!!loading} style={{background:`linear-gradient(135deg,${accent},${accent}99)`,border:"none",borderRadius:"9px",padding:"8px 13px",color:"#000",...J,fontWeight:800,fontSize:"12px",cursor:loading?"wait":"pointer"}}>
                    {loading===h.id?"✨...":"できた！"}
                  </button>
                  <button onClick={()=>handle(h,false)} disabled={!!loading} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"9px",padding:"8px 9px",color:"rgba(255,255,255,.4)",...J,fontSize:"10px",cursor:loading?"wait":"pointer"}}>できなかった</button>
                </div>
              )}
              {done&&<div style={{fontSize:"18px",animation:"bi .5s ease"}}>⭐</div>}
            </div>
          </div>
        );
      })}
      {doneCount===HABITS.length&&(
        <div style={{textAlign:"center",padding:"18px",background:`linear-gradient(135deg,${glow},${glow}55)`,border:`1px solid ${accent}`,borderRadius:"14px",marginTop:"6px",animation:"bi .5s ease"}}>
          <div style={{fontSize:"36px",marginBottom:"4px"}}>🏆</div>
          <div style={{...P,fontSize:"16px",fontWeight:900,color:accent}}>PERFECT DAY!</div>
          <div style={{fontSize:"10px",color:"rgba(255,255,255,.5)",marginTop:"3px"}}>全習慣クリア！+2ボーナスポイント！</div>
        </div>
      )}
    </div>
  );
}

// ===== 節約タブ =====
function SavingsTab({oshi,onMessage}){
  const [totalSavings,setTotalSavings]=useState(()=>storage.get("savings_total")||0);
  const [history,setHistory]=useState(()=>storage.get("savings_history")||[]);
  const [amount,setAmount]=useState("");
  const [spentAmount,setSpentAmount]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadingSpend,setLoadingSpend]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const [showSpend,setShowSpend]=useState(false);
  const [savingsImages,setSavingsImages]=useState(()=>storage.get("savings_stage_images")||{});
  const savStage=getSavingsStage(totalSavings);
  const updateSavingsImg=(sid,b64)=>{const ni={...savingsImages,[sid]:b64};setSavingsImages(ni);storage.set("savings_stage_images",ni);};
  const deleteSavingsImg=(sid)=>{const ni={...savingsImages};delete ni[sid];setSavingsImages(ni);storage.set("savings_stage_images",ni);};
  const nextSavStage=SAVINGS_STAGES.find(s=>s.minAmt>totalSavings);
  const prog=nextSavStage?((totalSavings-savStage.minAmt)/(nextSavStage.minAmt-savStage.minAmt))*100:100;
  const J={fontFamily:"'Josefin Sans',sans-serif"};
  const P={fontFamily:"'Playfair Display',serif"};
  const handleRecord=async()=>{
    const amt=parseInt(amount);if(!amt||amt<=0)return;
    setLoading(true);
    const newTotal=totalSavings+amt;
    const msg=await callSavingsOshi(amt,newTotal,oshi,savStage.name,savStage.spirit);
    const entry={date:getToday(),amount:amt,total:newTotal,id:Date.now()};
    const newHistory=[entry,...history].slice(0,50);
    setTotalSavings(newTotal);setHistory(newHistory);setAmount("");
    storage.set("savings_total",newTotal);storage.set("savings_history",newHistory);
    setLoading(false);
    onMessage({msg,success:true,type:"savings",amount:amt});
  };
  const handleSpend=async()=>{
    const amt=parseInt(spentAmount);if(!amt||amt<=0)return;
    setLoadingSpend(true);
    const msg=await callOshiLetter(amt,totalSavings,oshi,savStage);
    const newTotal=Math.max(0,totalSavings-amt);
    const entry={date:getToday(),amount:-amt,total:newTotal,id:Date.now(),type:"spend"};
    const newHistory=[entry,...history].slice(0,50);
    setTotalSavings(newTotal);setHistory(newHistory);setSpentAmount("");setShowSpend(false);
    storage.set("savings_total",newTotal);storage.set("savings_history",newHistory);
    setLoadingSpend(false);
    onMessage({msg,success:true,type:"letter",amount:amt});
  };
  return(
    <div>
      <div style={{position:"relative",background:"rgba(255,255,255,.04)",border:`1px solid ${savStage.accent}44`,borderRadius:"18px",padding:"20px",marginBottom:"14px",textAlign:"center",overflow:"hidden"}}>
        <Sparkles color={savStage.accent}/>
        <div style={{position:"relative",display:"inline-block",marginBottom:"6px"}}>
          {savingsImages[savStage.id]
            ?<img src={savingsImages[savStage.id]} alt="" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`3px solid ${savStage.accent}`,boxShadow:`0 0 20px ${savStage.accent}66`,animation:"fl 3s ease-in-out infinite"}}/>
            :<div style={{fontSize:"56px",filter:`drop-shadow(0 0 16px ${savStage.accent})`,animation:"fl 3s ease-in-out infinite",lineHeight:1}}>{savStage.avatar}</div>
          }
          <div style={{position:"absolute",bottom:-4,right:-4}}>
            <ImageUploadBtn accent={savStage.accent} small={true} onUpload={(b64)=>updateSavingsImg(savStage.id,b64)}/>
          </div>
        </div>
        {savingsImages[savStage.id]&&<button onClick={()=>deleteSavingsImg(savStage.id)} style={{display:"block",margin:"0 auto 4px",background:"rgba(255,0,0,.15)",border:"1px solid rgba(255,0,0,.3)",borderRadius:"16px",padding:"3px 10px",color:"#ff6666",fontFamily:"'Josefin Sans',sans-serif",fontSize:"10px",cursor:"pointer"}}>画像を削除</button>}
        <div style={{...J,fontSize:"9px",letterSpacing:".3em",color:savStage.accent,textTransform:"uppercase"}}>SAVINGS STAGE {savStage.id} — ARASHI 嵐</div>
        <div style={{...P,fontSize:"20px",fontWeight:900,fontStyle:"italic",color:"#fff",margin:"3px 0",textShadow:`0 0 16px ${savStage.accent}`}}>🎵 {savStage.name}</div>
        <div style={{fontSize:"11px",color:"rgba(255,255,255,.45)",marginBottom:"14px"}}>{savStage.desc}</div>
        <div style={{marginBottom:"12px"}}>
          <div style={{...J,fontSize:"32px",fontWeight:800,color:savStage.accent}}>{formatYen(totalSavings)}</div>
          <div style={{fontSize:"9px",color:"rgba(255,255,255,.4)",letterSpacing:".1em"}}>累計節約額</div>
        </div>
        {nextSavStage?(
          <>
            <div style={{display:"flex",justifyContent:"space-between",...J,fontSize:"9px",color:"rgba(255,255,255,.3)",marginBottom:"4px"}}>
              <span>{savStage.name}</span><span>次: 🎵{nextSavStage.name}（あと{formatYen(nextSavStage.minAmt-totalSavings)}）</span>
            </div>
            <div style={{background:"rgba(255,255,255,.1)",borderRadius:"6px",height:"4px",overflow:"hidden"}}>
              <div style={{width:`${Math.min(prog,100)}%`,height:"100%",background:`linear-gradient(90deg,${savStage.accent},${nextSavStage?.accent||savStage.accent})`,transition:"width 1s ease"}}/>
            </div>
          </>
        ):<div style={{...J,fontSize:"10px",color:savStage.accent,letterSpacing:".2em"}}>🌸 2ヶ月達成！サクラ咲いた！🌸</div>}
      </div>

      <div style={{background:"rgba(255,255,255,.04)",border:`1px solid ${savStage.accent}33`,borderRadius:"14px",padding:"16px",marginBottom:"12px"}}>
        <div style={{...J,fontSize:"10px",color:savStage.accent,letterSpacing:".2em",marginBottom:"12px",textTransform:"uppercase"}}>💰 今日の節約を記録</div>
        <div style={{display:"flex",gap:"8px"}}>
          <div style={{position:"relative",flex:1}}>
            <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.4)",...J,fontSize:"14px"}}>¥</span>
            <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleRecord()} placeholder="500" style={{width:"100%",background:"rgba(255,255,255,.07)",border:`1px solid ${savStage.accent}55`,borderRadius:"10px",padding:"12px 12px 12px 28px",color:"#fff",...J,fontSize:"16px",outline:"none"}}/>
          </div>
          <button onClick={handleRecord} disabled={loading||!amount} style={{background:`linear-gradient(135deg,${savStage.accent},${savStage.accent}99)`,border:"none",borderRadius:"10px",padding:"12px 18px",color:"#000",...J,fontWeight:800,fontSize:"13px",cursor:loading||!amount?"not-allowed":"pointer",opacity:!amount?.5:1}}>
            {loading?"✨...":"記録！"}
          </button>
        </div>
        <div style={{display:"flex",gap:"6px",marginTop:"10px",flexWrap:"wrap"}}>
          {[500,1000,2000,3000,5000].map(v=>(
            <button key={v} onClick={()=>setAmount(String(v))} style={{background:amount==v?`${savStage.accent}33`:"rgba(255,255,255,.06)",border:`1px solid ${amount==v?savStage.accent:"rgba(255,255,255,.12)"}`,borderRadius:"16px",padding:"5px 10px",color:amount==v?savStage.accent:"rgba(255,255,255,.5)",...J,fontSize:"11px",cursor:"pointer"}}>¥{v.toLocaleString()}</button>
          ))}
        </div>
      </div>

      <button onClick={()=>setShowSpend(v=>!v)} style={{width:"100%",background:"linear-gradient(135deg,rgba(255,215,0,.1),rgba(255,215,0,.05))",border:"1px solid rgba(255,215,0,.4)",borderRadius:"14px",padding:"14px 16px",color:"#ffd700",...J,fontSize:"13px",fontWeight:700,cursor:"pointer",textAlign:"left",marginBottom:"8px"}}>
        💌 推し活貯金を使う（特別なお手紙が届く）{showSpend?" ▲":" ▼"}
      </button>
      {showSpend&&(
        <div style={{background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.3)",borderRadius:"14px",padding:"16px",marginBottom:"12px"}}>
          <div style={{fontSize:"12px",color:"rgba(255,255,255,.5)",marginBottom:"12px",fontFamily:"'Noto Sans JP',sans-serif"}}>使った金額を入力すると、推しから特別なお手紙が届きます 💌</div>
          <div style={{display:"flex",gap:"8px"}}>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.4)",...J,fontSize:"14px"}}>¥</span>
              <input type="number" value={spentAmount} onChange={e=>setSpentAmount(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSpend()} placeholder="例：5000" style={{width:"100%",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,215,0,.4)",borderRadius:"10px",padding:"12px 12px 12px 28px",color:"#fff",...J,fontSize:"16px",outline:"none"}}/>
            </div>
            <button onClick={handleSpend} disabled={loadingSpend||!spentAmount} style={{background:"linear-gradient(135deg,#ffd700,#ffb700)",border:"none",borderRadius:"10px",padding:"12px 16px",color:"#000",...J,fontWeight:800,fontSize:"13px",cursor:loadingSpend||!spentAmount?"not-allowed":"pointer",opacity:!spentAmount?.5:1}}>
              {loadingSpend?"💌...":"送信"}
            </button>
          </div>
        </div>
      )}

      <button onClick={()=>setShowHistory(v=>!v)} style={{width:"100%",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px",padding:"11px 14px",color:"rgba(255,255,255,.4)",...J,fontSize:"11px",cursor:"pointer",textAlign:"left",marginBottom:"6px"}}>
        📋 記録履歴 ({history.length}件) {showHistory?"▲":"▼"}
      </button>
      {showHistory&&history.length>0&&(
        <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"12px",padding:"12px",maxHeight:"200px",overflowY:"auto"}}>
          {history.map(h=>(
            <div key={h.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <span style={{fontSize:"10px",color:"rgba(255,255,255,.4)",...J}}>{h.date}</span>
              <span style={{...J,fontSize:"13px",fontWeight:700,color:h.type==="spend"?"#ff6666":savStage.accent}}>{h.type==="spend"?"−":"+"}{formatYen(Math.abs(h.amount))}</span>
              <span style={{fontSize:"9px",color:"rgba(255,255,255,.3)",...J}}>累計 {formatYen(h.total)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:"18px"}}>
        <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:"9px",letterSpacing:".3em",color:"rgba(255,255,255,.2)",marginBottom:"8px",textTransform:"uppercase"}}>🎵 ARASHI STAGE JOURNEY（¥500/日・2ヶ月で制覇）</div>
        {SAVINGS_STAGES.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",marginBottom:"4px",borderRadius:"9px",background:s.id===savStage.id?s.glow:"rgba(255,255,255,.02)",border:`1px solid ${s.id===savStage.id?s.accent:"rgba(255,255,255,.05)"}`,opacity:totalSavings>=s.minAmt?1:.35,transition:"all .4s"}}>
            <span style={{fontSize:"18px",filter:totalSavings>=s.minAmt?"none":"grayscale(1)"}}>{totalSavings>=s.minAmt?s.avatar:"🔒"}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:"11px",fontWeight:700,color:s.id===savStage.id?s.accent:"rgba(255,255,255,.45)"}}>🎵 {s.name}</div>
              <div style={{fontSize:"9px",color:"rgba(255,255,255,.2)"}}>{formatYen(s.minAmt)}〜{s.maxAmt===Infinity?"":formatYen(s.maxAmt)}</div>
            </div>
            {s.id===savStage.id&&<div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:"9px",color:s.accent}}>NOW ✦</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageModal({modal,oshi,onClose}){
  if(!modal)return null;
  const isLetter=modal.type==="letter";
  const accent=isLetter?"#ffd700":oshi.color;
  const glow=accent+"44";
  const J={fontFamily:"'Josefin Sans',sans-serif"};
  const P={fontFamily:"'Playfair Display',serif"};
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.9)",backdropFilter:"blur(12px)",animation:"fi .3s ease",padding:"20px"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{position:"relative",background:isLetter?"linear-gradient(135deg,#0a0a08,#1a160a)":"linear-gradient(135deg,#0a0a0a,#160a16)",border:`1px solid ${accent}`,borderRadius:"22px",padding:"28px 24px",maxWidth:"360px",width:"100%",boxShadow:`0 0 50px ${glow}`,textAlign:"center",overflow:"hidden",maxHeight:"85vh",overflowY:"auto"}}>
        <Sparkles color={accent} n={8}/>
        {isLetter&&<div style={{fontSize:"30px",marginBottom:"8px"}}>💌</div>}
        <div style={{width:64,height:64,borderRadius:"50%",overflow:"hidden",border:`2px solid ${accent}`,margin:"0 auto 12px",boxShadow:`0 0 18px ${glow}`,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.3)"}}>
          {oshi.image?<img src={oshi.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:"30px"}}>🌟</span>}
        </div>
        <div style={{...P,fontStyle:"italic",fontSize:isLetter?"13px":"11px",color:accent,letterSpacing:".15em",marginBottom:"14px",textTransform:"uppercase"}}>
          {isLetter?`— ${oshi.name} からの特別なお手紙 —`:`— ${oshi.name} より —`}
        </div>
        <div style={{fontFamily:"'Noto Serif JP',serif",fontSize:isLetter?"13px":"14px",lineHeight:isLetter?2:1.95,color:"rgba(255,255,255,.92)",marginBottom:"22px",whiteSpace:"pre-wrap",textAlign:isLetter?"left":"center"}}>
          {modal.msg}
        </div>
        <button onClick={onClose} style={{background:`linear-gradient(135deg,${accent},${isLetter?"#ffb700":accent+"88"})`,border:"none",borderRadius:"24px",padding:"11px 26px",color:"#000",...J,fontWeight:800,fontSize:"13px",cursor:"pointer"}}>
          {isLetter?"大切に読みました 💕":modal.success?`ありがとう、${oshi.name}！`:"よし、明日がんばる！"}
        </button>
      </div>
    </div>
  );
}

export default function App(){
  const [oshi,setOshi]=useState(()=>storage.get("oshi_setting")||null);
  const [showSetup,setShowSetup]=useState(false);
  const [tab,setTab]=useState("habit");
  const [modal,setModal]=useState(null);
  const accent=oshi?.color||"#2ecc71";
  const bgColor=oshi?.bgColor||accent;
  const J={fontFamily:"'Josefin Sans',sans-serif"};
  const P={fontFamily:"'Playfair Display',serif"};
  const handleSaveOshi=o=>{setOshi(o);setShowSetup(false);storage.set("oshi_setting",o);};
  if(!oshi||showSetup)return <OshiSetup oshi={oshi||DEFAULT_OSHI} onSave={handleSaveOshi}/>;
  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Josefin+Sans:wght@400;700;800&family=Noto+Serif+JP&family=Noto+Sans+JP&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{background:#080808}
        @keyframes sp{0%,100%{opacity:.2;transform:scale(.8) rotate(0)}50%{opacity:.8;transform:scale(1.2) rotate(20deg)}}
        @keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fi{from{opacity:0}to{opacity:1}}
        @keyframes bi{0%{transform:scale(0);opacity:0}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
        button:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${accent};border-radius:2px}
      `}</style>
      <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at top,${bgColor}44 0%,#080808 55%)`,padding:"20px 14px 100px",transition:"background 1.2s"}}>
        <div style={{maxWidth:"420px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"16px"}}>
            <div style={{...J,fontSize:"9px",letterSpacing:".4em",color:accent,textTransform:"uppercase",marginBottom:"4px"}}>MY LIFE JOURNAL</div>
            <div style={{...P,fontSize:"30px",fontWeight:900,fontStyle:"italic",background:`linear-gradient(135deg,#fff,${accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Habit Haus</div>
          </div>
          <div style={{background:`linear-gradient(135deg,${accent}22,rgba(255,255,255,.03))`,border:`1px solid ${accent}44`,borderRadius:"14px",padding:"12px 14px",marginBottom:"16px",display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:46,height:46,borderRadius:"50%",overflow:"hidden",border:`2px solid ${accent}`,boxShadow:`0 0 12px ${accent}44`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.3)"}}>
              {oshi.image?<img src={oshi.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:"22px"}}>🌟</span>}
            </div>
            <div style={{flex:1}}>
              <div style={{...P,fontSize:"15px",fontWeight:900,fontStyle:"italic",color:accent}}>{oshi.name}</div>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,.4)"}}>今日も一緒に頑張ろう ✦</div>
            </div>
            <button onClick={()=>setShowSetup(true)} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"18px",padding:"6px 11px",color:"rgba(255,255,255,.45)",...J,fontSize:"10px",cursor:"pointer"}}>変更</button>
          </div>
          <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderRadius:"14px",padding:"4px",marginBottom:"18px",gap:"4px"}}>
            {[["habit","🌱 習慣"],["savings","💰 節約"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:tab===id?`linear-gradient(135deg,${accent},${accent}99)`:"transparent",border:"none",borderRadius:"10px",padding:"11px 8px",color:tab===id?"#000":"rgba(255,255,255,.4)",...J,fontWeight:tab===id?800:400,fontSize:"13px",cursor:"pointer",transition:"all .3s"}}>{label}</button>
            ))}
          </div>
          {tab==="habit"&&<HabitTab oshi={oshi} onMessage={setModal}/>}
          {tab==="savings"&&<SavingsTab oshi={oshi} onMessage={setModal}/>}
          <div style={{textAlign:"center",marginTop:"28px"}}>
            <button onClick={()=>{if(window.confirm("全データをリセットしますか？")){["oshi_setting","habit_pts","habit_streak","habit_td","savings_total","savings_history"].forEach(k=>storage.del(k));setOshi(null);}}} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.1)",...J,fontSize:"9px",cursor:"pointer"}}>reset all data</button>
          </div>
        </div>
      </div>
      <MessageModal modal={modal} oshi={oshi} onClose={()=>setModal(null)}/>
    </>
  );
}
