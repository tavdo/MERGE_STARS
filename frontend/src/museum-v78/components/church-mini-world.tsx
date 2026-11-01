"use client";

import { useState } from "react";
import { Cross, HandHeart, History, Ruler, Sparkles } from "lucide-react";

export function ChurchMiniWorld() {
  const [focus, setFocus] = useState<"overview" | "icon" | "cross">("overview");
  const [size, setSize] = useState("medium");
  return <section className="church-mini-world" aria-label="ეკლესიის ცოცხალი მიკრო-სამყარო" data-presentation="ARCHITECTURAL_CONCEPT">
    <div className="church-mini-art" role="img" aria-label="ეკლესიის პატარა მაკეტის კონცეპტუალური დარბაზი"><div className="church-dome"/><div className="church-icon" onClick={() => setFocus("icon")} role="button" tabIndex={0} onKeyDown={event => (event.key === "Enter" || event.key === " ") && setFocus("icon")}><span>✦</span><small>ხატი</small></div><div className="church-cross" onClick={() => setFocus("cross")} role="button" tabIndex={0} onKeyDown={event => (event.key === "Enter" || event.key === " ") && setFocus("cross")}><Cross size={34}/><small>ჯვარი</small></div></div>
    <div className="church-mini-copy"><span className="eyebrow">LIVING CHURCH · MINIATURE WORLD</span><h3>არქიტექტურა, ისტორია და შეკვეთა — ერთ პატარა მაკეტში.</h3><p>დაჭირე ხატს ან ჯვარს. ისტორია და ლოცვა მხოლოდ დამტკიცებული წყაროდან ჩაიტვირთება; ამჟამად ადგილობრივი ტექსტი არ იგონება.</p>
      <div className="church-mini-actions"><button className={focus === "icon" ? "active" : ""} onClick={() => setFocus("icon")}><History size={15}/> ხატის ისტორია</button><button className={focus === "icon" ? "active" : ""} onClick={() => setFocus("icon")}><HandHeart size={15}/> ლოცვის წყარო</button><button className={focus === "cross" ? "active" : ""} onClick={() => setFocus("cross")}><Cross size={15}/> ჯვრის გენერაცია</button></div>
      {focus === "icon" && <div className="church-mini-panel"><h4><History size={16}/> ხატის ისტორია / ლოცვა</h4><p>CORE_RIGHTS_AND_SOURCE_REQUIRED — ამ ეკლესიის ექსპონატისთვის ისტორია, ავტორობა და ლოცვის ტექსტი ჯერ არ არის ავტორიტეტულად დაკავშირებული. აქ ტექსტი არ გამოიგონება.</p><button disabled><Sparkles size={15}/> Create My Icon · CORE კავშირის მოლოდინი</button></div>}
      {focus === "cross" && <div className="church-mini-panel"><h4><Cross size={16}/> ჯვრის კონფიგურაცია</h4><label>ზომა<select value={size} onChange={event => setSize(event.target.value)}><option value="small">პატარა</option><option value="medium">საშუალო</option><option value="large">დიდი</option></select></label><p>კონფიგურაცია ინახება მხოლოდ როგორც CONCEPT. გენერაცია, მასალა, ზომის დამტკიცება და შეკვეთა საჭიროებს CORE + Meshy უფლებამოსილ კავშირს.</p><button disabled><Ruler size={15}/> Generate Cross · CORE_DEPENDENCY_REQUIRED</button></div>}
      {focus === "overview" && <p className="fine-note">ეს არის ცოცხალი ინტერფეისის მაკეტი: სივრცე, ექსპონატები და მოქმედებები მზადაა, ხოლო რელიგიური წყარო, უფლებები, წარმოება და ფიზიკური გადატანა მხოლოდ მტკიცებულების მიღების შემდეგ ჩაირთვება.</p>}
    </div>
  </section>;
}
