"use client";
import { useState } from "react";
import { Baby, Blocks, Castle, Sparkles } from "lucide-react";
import { CoreCatalogBrowser } from "@/living-museum/components/core-context";
import { MuseumGenerationStatus } from "@/living-museum/components/museum-activity";

const sections = ["ეტლები", "ლულკები და საწოლები", "სათამაშოები", "თამაშის პერსონაჟები", "თოჯინები"] as const;

// Owner-requested curatorial labels; these create no registry/House or rights.
export function MuseumChildren() {
  const [section, setSection] = useState<(typeof sections)[number]>(sections[0]);
  return <div className="museum-children">
    <div className="children-heading"><Baby size={27} /><div><span className="eyebrow">BABE / RUMI · MUSEUM CONCEPT</span><h3>ბავშვების კუთხე</h3></div></div>
    <p>აღმოაჩინე, დაამუშავე შენი ვერსია და დაუბრუნე იგი მუზეუმის ვიტრინას.</p>
    <div className="children-sections" role="group" aria-label="საბავშვო კუთხის მიმართულებები">{sections.map(label => <button key={label} aria-pressed={section === label} onClick={() => setSection(label)}>{label}</button>)}</div>
    <div className="children-vitrine" aria-live="polite"><div><Blocks size={29} /><Castle size={34} /><Sparkles size={23} /></div><h3>{section}</h3><p>ექსპონატების დაკავშირების მოლოდინში</p></div>
    <p className="fine-note">BABE / RUMI შენი მითითებული კუთხის სახელებია. CORE Brand House-ის, პროდუქტისა და უფლებების ჩანაწერები ჯერ არ არის დაკავშირებული; ამ კუთხესთან არცერთი საჯარო კოლექცია ავტომატურად არ ასოცირდება.</p>
    <MuseumGenerationStatus sourceReference={null} />
    <CoreCatalogBrowser presentation="vitrine" />
  </div>;
}
