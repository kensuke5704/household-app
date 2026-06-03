
"use client";
import { useEffect, useState } from "react";
export default function LoginGate({children}:{children:React.ReactNode}){
 const [ok,setOk]=useState(false);
 const [pw,setPw]=useState("");
 useEffect(()=>{ if(localStorage.getItem("household_auth")==="ok") setOk(true);},[]);
 const pass=process.env.NEXT_PUBLIC_APP_PASSWORD || "household";
 if(ok) return <>{children}</>;
 return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
 <div style={{background:"#fff",padding:32,borderRadius:12,width:400}}>
 <h2>ログイン</h2>
 <input value={pw} onChange={e=>setPw(e.target.value)} type="password" style={{width:"100%",padding:12}}/>
 <button onClick={()=>{if(pw===pass){localStorage.setItem("household_auth","ok");setOk(true)}else alert("パスワードが違います");}} style={{width:"100%",padding:12,marginTop:12}}>ログイン</button>
 </div></div>
}
