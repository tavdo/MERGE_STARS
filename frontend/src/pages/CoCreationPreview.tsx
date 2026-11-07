import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MergeMasterLogo from '../components/MergeMasterLogo'
import './co-creation-preview.css'

const industries = [
  [
    'Fashion & Luxury',
    'მოდა და ლუქსი',
    'სამოსი · საათები · სათვალე · სამკაული · ჩანთები',
    'fashion',
  ],
  [
    'Mobility & Engineering',
    'მობილობა და ინჟინერია',
    'ავტომობილი · მოტოციკლი · იახტა · პერსონალური ინტერიერი',
    'mobility',
  ],
  [
    'Home & Family',
    'სახლი და ოჯახი',
    'ავეჯი · ტექსტილი · საოჯახო ნივთები · საქორწინო კოლექცია',
    'family',
  ],
  [
    'Architecture & Decor',
    'არქიტექტურა და დეკორი',
    'შენობა · ინტერიერი · განათება · სივრცის რეკონსტრუქცია',
    'architecture',
  ],
  [
    'Kids, Toys & Games',
    'ბავშვები და თამაშები',
    'სათამაშოები · თამაშები · საბავშვო სივრცეები',
    'kids',
  ],
  [
    'Music & Sound',
    'მუსიკა და ხმა',
    'ინსტრუმენტები · აუდიო · სცენის დიზაინი',
    'music',
  ],
  [
    'Office & Education',
    'ოფისი და განათლება',
    'საკანცელარიო ნივთები · სასწავლო სივრცე · სამუშაო გარემო',
    'education',
  ],
  [
    'Technology & Future',
    'ტექნოლოგია და მომავალი',
    'ჭკვიანი მოწყობილობები · რობოტიკა · ახალი იდეები',
    'technology',
  ],
  [
    'Art, Mosaic & Culture',
    'ხელოვნება და მოზაიკა',
    'ქანდაკება · მოზაიკა · კულტურა · Renaissance House',
    'art',
  ],
  [
    'Sports & Outdoor',
    'სპორტი და ბუნება',
    'ეკიპირება · აქტიური ცხოვრება · გარე სივრცეები',
    'sports',
  ],
  [
    'Beauty & Wellbeing',
    'სილამაზე და კეთილდღეობა',
    'სილამაზის აქსესუარები · პერსონალური მოვლის დიზაინი',
    'beauty',
  ],
  [
    'Sacred Art & Heritage',
    'საკრალური ხელოვნება',
    'მემკვიდრეობა · ხელობა · კულტურული ობიექტები',
    'heritage',
  ],
] as const
const stages = [
  [
    'რეგისტრაცია',
    'შექმენი პირადი პროფილი პასპორტით ან ID ბარათით.',
    '/login?tab=register',
  ],
  [
    'შენი მოთხოვნა',
    'აირჩიე ინდუსტრია და აღწერე იდეა. სურვილი ჯერ შეკვეთა არ არის.',
    '/create',
  ],
  [
    'ერთად შექმნა',
    'გახსენით დიზაინის სამუშაო სივრცე. რეალური AI გენერაცია საჭიროებს მოქმედ სერვისს.',
    '/create',
  ],
  [
    'ბრენდის განხილვა',
    'გაეცანი ბრენდებს. კონკრეტული პარტნიორის მონაწილეობა ცალკე დასტურდება.',
    '/houses',
  ],
  [
    'წარმოება',
    'დაიწყება მხოლოდ დადასტურებული შეკვეთით, დაფარვითა და ტექნიკური შემოწმებით.',
    '/production-request',
  ],
  [
    'მიწოდება და პასპორტი',
    'პროდუქტის პასპორტი უკავშირდება დადასტურებულ ნივთსა და მის ისტორიას.',
    '/passport',
  ],
  [
    'მუზეუმში შენახვა',
    'საკუთარი ნამუშევრები დაათვალიერე პირად მუზეუმში. საჯარო გამოჩენა ცალკე თანხმობას მოითხოვს.',
    '/my-museum',
  ],
  [
    'ცოცხალი ისტორია',
    'შექმენი შენი ბრენდის სამყარო და გააგრძელე კოლექცია.',
    '/my-world',
  ],
] as const

export default function CoCreationPreview() {
  const [selected, setSelected] = useState(0)
  const [stage, setStage] = useState(0)
  const referenceDialog = useRef<HTMLDialogElement>(null)
  const item = industries[selected]
  const createLink =
    '/create?' + new URLSearchParams({ application: `${item[0]} / ${item[1]}` })
  return (
    <div className="cc-world">
      <header className="cc-header">
        <Link to="/" className="cc-identity">
          <MergeMasterLogo decorative />
          <span>
            MERGE <b>✦</b> STARS<small>THE GLOBAL CO-CREATION PLATFORM</small>
          </span>
        </Link>
        <nav aria-label="მთავარი ნავიგაცია">
          <Link to="/museum">მუზეუმი</Link>
          <Link to="/houses">Brand Houses</Link>
          <Link to="/price-indicator">მეტალის ფასები</Link>
          <Link to="/login?tab=register" className="cc-gold">
            რეგისტრაცია ↗
          </Link>
        </nav>
      </header>
      <div className="cc-caption">
        <span>DESIGN PREVIEW · საცდელი ხედი</span>
        <span>YOUR IDEA. YOUR BRAND. YOUR WORLD.</span>
      </div>
      <main className="cc-layout">
        <aside className="cc-journey">
          <p className="cc-eyebrow">FROM IDEA TO LEGACY</p>
          <h2>როგორ მუშაობს MERGE</h2>
          <ol>
            {stages.map((s, i) => (
              <li key={s[0]}>
                <button onClick={() => setStage(i)} aria-pressed={stage === i}>
                  <span className="cc-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <strong>{s[0]}</strong>
                    <small>
                      {i === stage
                        ? s[1]
                        : [
                            'შექმენი შენი პროფილი',
                            'აირჩიე და აღწერე',
                            'გახსენი დიზაინის სტუდია',
                            'შეათანხმე შენი კონცეფცია',
                            'დადასტურებიდან შექმნამდე',
                            'ნივთის სანდო ისტორია',
                            'შენი კოლექციის სივრცე',
                            'გააგრძელე შენი სამყარო',
                          ][i]}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <Link className="cc-step-link" to={stages[stage][2]}>
            გახსენი ეტაპი {stage + 1} <span>↗</span>
          </Link>
        </aside>
        <section className="cc-center">
          <div className="cc-title">
            <p className="cc-eyebrow">TWELVE WORLDS. INFINITE POSSIBILITIES.</p>
            <h1>Grand Living Museum</h1>
            <p>12 ინდუსტრიის კონცეფცია · Brand Houses · შენი ახალი იდეა</p>
          </div>
          <div className="cc-map" aria-label="12 ინდუსტრიის არქიტექტურული რუკა">
            <div
              className="cc-map-image"
              role="img"
              aria-label="დამფუძნებლის მოწოდებული მუზეუმისა და თორმეტი ინდუსტრიის არქიტექტურული კონცეფცია"
            />
            <div className="cc-map-shade" />
            <Link to="/museum" className="cc-enter">
              <span>THE HEART OF MERGE</span>
              <strong>შედი მუზეუმში</strong>
              <span>EXPLORE YOUR WORLD ↗</span>
            </Link>
            <span className="cc-map-note">ARCHITECTURAL CONCEPT</span>
            <button
              className="cc-reference"
              type="button"
              onClick={() => referenceDialog.current?.showModal()}
            >
              ორიგინალი ფოტო ⤢
            </button>
          </div>
          <div
            className="cc-industries"
            role="group"
            aria-label="აირჩიე ინდუსტრია"
          >
            {industries.map((v, i) => (
              <button
                key={v[3]}
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{v[0]}</strong>
              </button>
            ))}
          </div>
          <section className="cc-selected" aria-live="polite">
            <div>
              <p className="cc-eyebrow">
                INDUSTRY {String(selected + 1).padStart(2, '0')}
              </p>
              <h2>{item[1]}</h2>
              <p>{item[2]}</p>
            </div>
            <Link className="cc-gold" to={createLink}>
              შექმენი შენი ვერსია ↗
            </Link>
          </section>
        </section>
        <aside className="cc-principles">
          <p className="cc-eyebrow">ONE WORLD · TWO SPACES</p>
          <h2>ბრენდი და მუზეუმი</h2>
          <article>
            <span className="cc-symbol">⌂</span>
            <p className="cc-eyebrow">THE ORIGINAL COLLECTION</p>
            <h3>Brand House</h3>
            <p>
              ბრენდის არსებული კოლექცია, მისი ოფიციალური კატალოგი და ორიგინალი
              ნივთები.
            </p>
            <Link to="/houses">დაათვალიერე ბრენდები ↗</Link>
          </article>
          <article>
            <span className="cc-symbol">✦</span>
            <p className="cc-eyebrow">THE NEW CREATIONS</p>
            <h3>Grand Living Museum</h3>
            <p>
              ადამიანებისა და ბრენდების ახალი ნამუშევრები — საჯაროდ მხოლოდ
              შესაბამისი თანხმობისა და უფლებების დადასტურების შემდეგ.
            </p>
            <Link to="/museum">გახსენი მუზეუმი ↗</Link>
          </article>
          <article className="cc-core">
            <span>∞</span>
            <h3>მთავარი პრინციპი</h3>
            <p>
              არსებული კოლექცია რჩება ბრენდის სახლში. ყოველი ახალი იდეა შეიძლება
              გახდეს ცოცხალი მუზეუმის ნაწილი.
            </p>
          </article>
        </aside>
        <section className="cc-example">
          <div>
            <p className="cc-eyebrow">YOUR PERSONAL REQUEST</p>
            <h2>იდეა, რომელსაც შენი ხელწერა აქვს.</h2>
            <p>
              აირჩიე სფერო, მოამზადე მოთხოვნა და განაგრძე არსებულ სამუშაო
              სივრცეში.
            </p>
          </div>
          <div className="cc-example-links">
            {[
              ['საათი', 'Watch design'],
              ['ავტომობილი', 'Vehicle design'],
              ['ჩანთა', 'Bag design'],
            ].map(([label, value]) => (
              <Link
                key={value}
                to={'/create?' + new URLSearchParams({ application: value })}
              >
                <span>✧</span>
                {label}
                <small>დიზაინის მოთხოვნა ↗</small>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="cc-footer">
        <span>MERGE ✦ STARS</span>
        <span>12 INDUSTRIES · CO-CREATION · LIVING HISTORY</span>
        <Link to="/">არსებულ მთავარ გვერდზე დაბრუნება ↗</Link>
      </footer>
      <dialog
        ref={referenceDialog}
        className="cc-overlay"
        aria-label="ორიგინალი რეფერენსი"
      >
        <button
          type="button"
          autoFocus
          onClick={() => referenceDialog.current?.close()}
        >
          დახურვა ×
        </button>
        <img
          src="/museum/co-creation-reference-20261105.png"
          alt="მოწოდებული MERGE ინფოგრაფიკა — ბრენდების მაგალითები ილუსტრაციულია და პარტნიორობას არ ადასტურებს"
        />
        <p>
          ორიგინალი რეფერენსი. მითითებული ბრენდები ილუსტრაციული მაგალითებია.
        </p>
      </dialog>
    </div>
  )
}
