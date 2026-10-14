# Smernice za dizajn operativnog portala

**Verzija:** 1.0  
**Referentna stranica:** „Otvoreni nalozi“ (`otvoreniNaloziNovo.ejs` + `otvoreniNaloziNovo.css`)  
**Vizuelni pravac:** moderan, ozbiljan, administrativni interfejs inspirisan preglednošću eUprava portala, prilagođen firmi koja vodi vodoinstalaterske, terenske i komunalne poslove.

> Ovo je **interni dizajn sistem**, ne zvanični državni vizuelni identitet. Cilj je dosledan izgled budućih stranica, bez korišćenja državnih simbola i bez predstavljanja portala kao zvanične državne usluge.

---

## 1. Osnovni karakter dizajna

- **Profesionalno i mirno:** tamnoplava za naslove i primarne akcije, svetloplava za isticanje, bele kartice na vrlo svetloj sivo-plavoj pozadini.
- **Informacija ispred dekoracije:** podaci, filteri i statusi imaju prednost nad ilustracijama, velikim senkama i animacijama.
- **Operativna gustina:** dovoljno prostora za čitljivost, ali bez preterano velikih elemenata koji usporavaju rad u tabelama.
- **Jedinstvena semantika:** boja predstavlja isto značenje na svakoj stranici (crvena = problem, žuta = pažnja, zelena = pozitivno, plava = neutralna akcija/informacija).
- **Diskretne površine:** tanki obrubi, radius 7–12 px, gotovo neprimetne senke.
- **Lokalni jezik:** korisnički tekst na srpskom; po mogućnosti jedna dosledna varijanta pisma po stranici. Referentna stranica koristi ćirilicu u većini oznaka.

## 2. Paleta boja — konkretne vrednosti iz referentnog CSS-a

| Uloga | HEX | Upotreba |
|---|---|---|
| Primarna tamnoplava | `#173E68` | Primarna dugmad, sekundarni naslovi, identitet modula |
| Duboka tamnoplava | `#0E2C4D` | Naslov stranice, glavni brojevi, važni naslovi |
| Akcent plava | `#176DA8` | Linkovi, ikonice, aktivne kontrole |
| Svetloplava | `#EAF3FA` | Pozadine ikonica, vrlo nežno isticanje |
| Osnovni tekst | `#24364B` | Tekst u celom portalu |
| Prigušeni tekst | `#728297` | Opisi, pomoćni tekst, metapodaci |
| Granice | `#DFE6EE` | Obrubi panela i kartica |
| Pozadina stranice | `#F4F7FA` | Pozadina modula |
| Površina | `#FFFFFF` | Paneli, forme, tabele, kartice |
| Informativno (blue chip) | `#E8F2FB` / `#276EA1` | Pozadina / tekst informativnog statusa |
| Pažnja (amber chip) | `#FFF4DF` / `#956A28` | Potrebna pažnja, kašnjenje, nezakazano |
| Pozitivno (green chip) | `#E9F6EE` / `#357A5E` | Završeno, potvrđeno, uspešno |
| Problem (red chip) | `#FDEBEC` / `#B04A4C` | Urgencije i upozorenja |
| Kritično | `#BC2632` | Bez ijednog komentara / istinski kritična situacija |
| Kritično — svetla podloga | `#FCE2E4` | Pozadina dodatnog upozorenja |
| Stari komentar — svetlocrvena | `#FFF0F0` / `#A94B4B` | Poslednji komentar stariji od 48 sati |

**Važno:** Ne uvoditi novu nijansu za isti status bez potrebe. Kritično crveno (`#BC2632`) čuvati za ozbiljne probleme; ne koristiti ga za obične ikonice ili svako dugme.

### CSS varijable za nove module

Na postojećoj stranici su varijable sa prefiksom `--on-*`, definisane u `.on-page`. Za **nove** stranice možeš koristiti generički prefiks `--portal-*` i zadržati identične boje:

```css
.portal-ui {
    --portal-primary: #173e68;
    --portal-primary-strong: #0e2c4d;
    --portal-blue: #176da8;
    --portal-blue-light: #eaf3fa;

    --portal-text: #24364b;
    --portal-muted: #728297;
    --portal-border: #dfe6ee;
    --portal-background: #f4f7fa;
    --portal-surface: #ffffff;

    --portal-success-bg: #e9f6ee;
    --portal-success: #357a5e;
    --portal-warning-bg: #fff4df;
    --portal-warning: #956a28;
    --portal-danger-bg: #fdebec;
    --portal-danger: #b04a4c;
    --portal-critical: #bc2632;

    --portal-radius-panel: 12px;
    --portal-radius-control: 7px;
    --portal-radius-badge: 6px;
    --portal-shadow: 0 2px 7px rgba(20, 48, 78, .025);

    color: var(--portal-text);
    background: var(--portal-background);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
}

.portal-ui *,
.portal-ui *::before,
.portal-ui *::after { box-sizing: border-box; }

.portal-ui button,
.portal-ui input,
.portal-ui select,
.portal-ui textarea { font: inherit; }
```

**Napomena o kompatibilnosti:** Gornji tokeni služe za buduće stranice. Ne menjati postojeće `--on-*` varijable ili klase `.on-*` bez potrebe; ako novi modul koristi postojeći CSS, preuzeti odgovarajuće vrednosti, a ne nužno imena klasa.

## 3. Tipografija

**Podrazumevana porodica:**

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
```

Inter nije obavezno učitavati spolja — ako nije dostupan, sistemski fontovi su predviđeni fallback. Za PDF koristiti font koji podržava ćirilicu (u postojećem projektu PTSans).

| Element | Preporučena veličina | Težina / napomena |
|---|---|---|
| Glavni naslov stranice (`h1`) | `clamp(24px, 2.5vw, 33px)` | 750, boja `#0E2C4D`, line-height 1.2 |
| Naslov panela | 15 px | 700–750, tamnoplava |
| Broj u KPI kartici | 23–30 px | 750–800, tabular-nums |
| Osnovni tekst | 14 px | 400–600 |
| Tekst u tabeli | 12 px | 400–650 |
| Labela polja | 12 px | 700 |
| Zaglavlje tabele | 10.5–11 px | 800, prigušena plava |
| Pomoćni tekst | 11–12 px | 400–600, siva |
| Gornji natpis (eyebrow) | 11 px | 800, uppercase, letter-spacing 1.4 px |

Izbegavati velike blokove potpuno podebljanog teksta. Isticanje koristiti za redne brojeve, iznose, statuse i akcije.

## 4. Raspored, razmaci i dimenzije

- **Maksimalna širina sadržaja:** `1620px`, centrirano.
- **Bočne margine na desktopu:** ukupno 48px (`width: min(1620px, calc(100% - 48px))`).
- **Bočne margine na mobilnom:** ukupno 26px.
- **Vertikalni padding stranice:** približno `30px 0 56px`; na mobilnom `20px 0 40px`.
- **Razmak između većih sekcija:** 22–25px.
- **Razmak između kartica:** 15px (10px na manjim širinama).
- **Unutrašnji padding panela:** tipično 19–22px.
- **Visina kontrola:** 42px.
- **Dugmad:** minimalna visina 36px; na telefonu i za ključne mobilne akcije cilj 44px.
- **Zaobljenja:** 12px paneli, 7px kontrole/dugmad, 5–6px badge/status.

**Smernica za raspored stranice:**

1. Naslov stranice + kratak opis (+ opciona ikonica/modul).
2. KPI kartice — samo kada brojevi imaju operativnu vrednost.
3. Panel sa filterima — jasno odvojen od tabele.
4. Panel s podacima — naslov, broj rezultata i akcije u zaglavlju; tabela ispod.
5. Po potrebi donji red s brojem zapisa i kratkim objašnjenjem.

## 5. Standardne komponente

### 5.1 Panel

Panel je bela površina s tankim obrubom; bez agresivne senke.

```css
.portal-ui .portal-panel {
    background: var(--portal-surface);
    border: 1px solid var(--portal-border);
    border-radius: var(--portal-radius-panel);
    box-shadow: var(--portal-shadow);
}

.portal-ui .portal-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 19px 22px;
}

.portal-ui .portal-panel__title {
    margin: 0;
    color: var(--portal-primary-strong);
    font-size: 15px;
    font-weight: 750;
}
```

### 5.2 KPI kartica

- Bela pozadina, obrub `#DFE6EE`, radius 12px.
- Mala ikonica u obojenom kvadratu (~49 × 49px, radius 11px).
- Levo diskretna linija širine 3px u boji semantike kartice.
- Redom: opis (12px), veliki broj (23–30px), pomoćni tekst (11px).
- Primeri kategorija iz referentne stranice:
  - Ukupno prikazanih: plava `#176DA8` + podloga `#EAF3FA`.
  - Nezakazani: oker `#A97318` + podloga `#FFF5E3`.
  - Urgirani: prigušena crvena `#BF5051` + podloga `#FFF0F0`.
  - Početne faze: sivo-plava `#58718A` + podloga `#EDF1F5`.

### 5.3 Dugmad

- **Primarno:** puna tamnoplava podloga, beli tekst, radius 7px.
- **Sekundarno:** bela podloga, svetao obrub i tamnoplavi tekst.
- **Quiet/tercijarno:** bez obruba, tamnosivi/plavi tekst; za reset i pomoćne akcije.
- Ikonice levo, 16px; tekst 12px i podebljan.
- Hover menja nijansu pozadine, a ne geometriju ili veličinu.
- Kritične/destruktivne akcije crvene **samo** kada nose opasnu posledicu (brisanje, poništavanje).

```css
.portal-ui .portal-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 36px;
    padding: 8px 12px;
    border: 1px solid #d6e1ea;
    border-radius: 7px;
    background: #fff;
    color: #415b75;
    font-size: 12px;
    font-weight: 720;
    cursor: pointer;
    text-decoration: none;
    transition: background .15s ease, border-color .15s ease;
}

.portal-ui .portal-btn:hover {
    background: #f2f7fb;
    border-color: #afc8db;
}

.portal-ui .portal-btn--primary {
    background: var(--portal-primary);
    border-color: var(--portal-primary);
    color: white;
}

.portal-ui .portal-btn--primary:hover {
    background: #1f527f;
    border-color: #1f527f;
}

.portal-ui .portal-btn:focus-visible {
    outline: 3px solid #b2d7f4;
    outline-offset: 2px;
}
```

### 5.4 Forme i filteri

- Labele **iznad** kontrola; labela obično 12px, težina 700.
- Input/select visine 42px, bela pozadina, okvir `#D7E0E9`, radius 7px.
- Fokus: border `#4E96C6` + `box-shadow: 0 0 0 3px #DCEDF8`.
- Pomoćni tekst u svetlijoj sivo-plavoj; placeholder nije zamena za labelu.
- Za višestruki izbor radnih jedinica: kompaktni check-chip sa aktivnim stanjem svetloplave pozadine.
- Za jednostavan da/ne filter: mali switch (aktivna plava `#1C77B0`).
- Filteri treba da ostanu vidljivi i logično grupisani. Preporuka: svi filteri rade **zajedno** (AND logika), a broj rezultata i izvozi prate iste podatke.

```css
.portal-ui .portal-control {
    width: 100%;
    height: 42px;
    padding: 0 13px;
    border: 1px solid #d7e0e9;
    border-radius: 7px;
    color: #2b435b;
    background: white;
    font-size: 12.5px;
    outline: none;
}

.portal-ui .portal-control:focus {
    border-color: #4e96c6;
    box-shadow: 0 0 0 3px #dcedf8;
}
```

### 5.5 Tabele

Tabele su glavni deo operativnih stranica: moraju biti čitljive i kada imaju mnogo kolona.

- Zaglavlje: vrlo svetla sivo-plava `#F3F7FA`, tekst `#62778B`, font 10.5px / 800.
- Redovi: bela pozadina; donji separator `#EAF0F5`.
- Hover: `#F5FAFF` (diskretno).
- Otvoren/pregledan nalog: neutralno sivkasta podloga `#F0F4F7` ako je potrebno.
- Razmaci u ćelijama: najčešće 13px vertikalno, 11px horizontalno.
- Broj naloga je plavi link `#146CA7`, podebljan, otvara detalj.
- Adresa je malo istaknutija od običnog teksta (`#273E54`, weight ~620).
- Brojeve i datume poravnati konzistentno; za brojeve koristiti `font-variant-numeric: tabular-nums`.
- **Duga tabela ne sme sabiti sve kolone na par piksela.** Postaviti `min-width` i horizontalni scroll.
- Po mogućnosti sticky zaglavlje unutar skrolovanog kontejnera.
- Statusi idu u badge, ne u punu jako obojenu ćeliju (izuzetak: stvarno kritični slučajevi).

```css
.portal-ui .portal-table-scroll {
    width: 100%;
    max-height: 70vh;
    overflow: auto;
}

.portal-ui .portal-table {
    width: 100%;
    min-width: 1100px; /* prilagoditi stvarnom broju kolona */
    border-collapse: separate;
    border-spacing: 0;
    font-size: 12px;
}

.portal-ui .portal-table th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 14px 11px;
    text-align: left;
    background: #f3f7fa;
    color: #62778b;
    border-bottom: 1px solid #dfe7ee;
    font-size: 10.5px;
    font-weight: 800;
}

.portal-ui .portal-table td {
    padding: 13px 11px;
    border-bottom: 1px solid #eaf0f5;
    vertical-align: middle;
}

.portal-ui .portal-table tbody tr:hover td {
    background: #f5faff;
}
```

## 6. Statusi i upozorenja

| Značenje | Izgled | Pravilo |
|---|---|---|
| Neutralno / početno | Sivo ili sivo-plavi badge | Status bez hitnog rizika |
| Informacija | Svetloplavi badge | Informativni status, dodela |
| Pozitivno | Svetlozeleni badge | Potvrđeno, završeno, odobreno |
| Potrebna pažnja | Svetložuti badge | Nezakazano, nepoznat datum, potrebno proveriti |
| Problem | Svetlocrveni badge | Urgencija, zakasnela aktivnost |
| **Kritično** | Puna crvena `#BC2632`, beo tekst | **Nema nijednog komentara**, ozbiljan izuzetak |
| **Staro ažuriranje** | Svetlocrvena `#FFF0F0`, tekst `#A94B4B` | **Poslednji komentar stariji od 48 sati** |

**Primer pravila za komentare:**

1. `izvestaji.length === 0` → oznaka **БЕЗ КОМЕНТАРА**, kritična crvena.
2. Postoji komentar i pouzdan datum, ali je stariji od 48h → blaže crveno upozorenje, prikazati datum.
3. Postoji komentar, ali datum nije pouzdano parsiran → neutralno/oker **Датум није евидентиран**, ne nagađati starost komentara.
4. Za urgentne naloge koristiti crveni badge i prikazati broj urgencija. Ne farbati ceo red agresivno crveno.

**Nikada se ne oslanjati samo na boju.** Status uvek treba da ima tekst (npr. „Преко 48 сати“, „БЕЗ КОМЕНТАРА“).

## 7. Ikonice i vizuelni detalji

- Koristiti jednostavne **outline SVG ikonice**, po mogućstvu ugrađene u EJS (bez nove zavisnosti).
- Standardna veličina `20 × 20px`, `stroke-width: 1.8`, `fill="none"`.
- Unutar većih KPI kartica ikona može biti 24px; u dugmetu 16px.
- Za poslovnu tematiku: dokument/nalog, kalendar, alat/ključ, lokacija, osoba/majstor, upozorenje, filter, štampa, preuzimanje.
- Ikonice nisu dekorativna zamena za tekst: naročito kod akcija kombinovati ikonu i labelu.
- Bez zastava, grbova, državnih pečata ili vizuelnih oznaka koje sugerišu zvaničnu nadležnost.

## 8. Responsive pravila iz referentne stranice

| Širina | Pravilo |
|---|---|
| Preko 1300px | Četiri KPI kartice u redu; do pet filtera u redu ako staju |
| Do 1300px | Filter grid ide na tri kolone; KPI kartice kompaktnije |
| Do 900px | Dve KPI kartice u redu; dva filtera u redu; akcije mogu u novi red |
| Do 600px | Jedna kolona filtera; uži padding; KPI ostaje 2 u redu ako staje; tabelu horizontalno skrolovati |

**Ne praviti mobilnu tabelu tako što će se sve kolone suziti do nečitljivosti.** Na malim ekranima je bolja čitljiva tabela sa skrolom ili, za posebne slučajeve, namenski kartični prikaz.

## 9. Pristupačnost i ponašanje

- Jasni `:hover` i `:focus-visible` stilovi za dugmad, linkove, check-chipove i kontrole.
- Koristiti `<button>` za akcije, `<a>` za navigaciju i prave `<label>` elemente za inpute.
- Interaktivne elemente na mobilnom učiniti dovoljno velikim za dodir (poželjno 44px za glavne akcije).
- Statusi imaju **tekst + boju**; `title` može ponuditi dodatno objašnjenje.
- Redosled tab navigacije treba da prati vizuelni raspored.
- Ne oslanjati se na desni klik kao jedini način rada; ako postoji kao prečica za „samo ova radna jedinica“, obezbediti i pristupačan alternativni put.
- Datum prikazivati dosledno (`dd.MM.yyyy.` i vreme po potrebi), bez zamenjivanja praznog podatka netačnom vrednošću.
- Prilikom eksportovanja koristiti **iste filtrirane i sortirane podatke** kao na ekranu; PDF i CSV ne treba da prikazuju različit skup naloga.

## 10. Organizacija CSS-a i EJS-a

**Za postojeći ekran:** sačuvati izolaciju u `.on-page` i klase `.on-*`.  
**Za naredne module:** preporučeni roditelj je `.portal-ui` (ili namespace koji opisuje konkretnu stranicu), a klase poput `.portal-panel`, `.portal-control`, `.portal-btn` služe kao obrazac.

Primer strukture:

```html
<div class="portal-ui">
    <main class="portal-container">
        <header class="portal-page-heading">...</header>
        <section class="portal-stats">...</section>
        <section class="portal-panel portal-filters">...</section>
        <section class="portal-panel portal-results">...</section>
    </main>
</div>
```

**Pravila implementacije:**

- Ne pisati generički `div`, `table`, `.box`, `.button` ili `input` CSS bez roditeljskog namespace-a — lako narušava postojeći portal.
- Boje izvlačiti u CSS varijable na roditeljskom wrapper-u, umesto ponavljanja HEX vrednosti kroz mnogo komponenti.
- Za nove stranice koristiti zajednički osnovni stylesheet (npr. `portal-ui.css`), a posebne stilove držati u CSS-u konkretne stranice.
- Izbegavati inline stilove osim za semantičke dinamičke vrednosti (npr. promenljiva boja KPI kartice preko CSS custom property).
- Prilikom dorade postojećeg EJS-a sačuvati postojeća JS/EJS polja i ID-jeve koji se koriste u funkcijama; promena dizajna ne treba da pokvari filtre, pretragu, štampu ili izvoz.

## 11. Šta izbegavati

- Jarko crvene, plave ili zelene velike pozadine bez operativnog razloga.
- Velike gradijente, staklene (glassmorphism) površine i upadljive animacije.
- Previše različitih veličina fontova i proizvoljnih radiusa.
- Jako obojene cele redove tabele za obične statuse.
- Font ispod 11px za bitne podatke ili slabe kontraste.
- „Lep“ UI koji sakrije bitne filtere, oteža unos ili promeni značenje statusa.
- Globalni CSS koji narušava `partials/header`, `partials/footer` ili druge EJS stranice.

## 12. Mini kontrolna lista za novu stranicu

- [ ] Koristi tamnoplavu `#173E68` i naslove `#0E2C4D`.
- [ ] Pozadina je `#F4F7FA`, a sadržaj u belim panelima.
- [ ] Paneli imaju border `#DFE6EE`, radius 12px i diskretnu senku.
- [ ] Kontrole su visoke približno 42px; dugmad su jasna i diskretna.
- [ ] Forme i filteri imaju čitljive labele i fokus stanje.
- [ ] Statusi koriste istu semantiku boja i tekstualna objašnjenja.
- [ ] Tabele imaju svetlo zaglavlje, diskretne separatore i horizontalni scroll kad treba.
- [ ] Na mobilnom se filteri slažu vertikalno, a tekst ostaje čitljiv.
- [ ] Ikonice su jednostavni SVG outline simboli.
- [ ] CSS je izolovan u wrapper-u; EJS/JS funkcionalnost ostaje očuvana.

---

## 13. Kratka instrukcija za sledeći dizajn zadatak

Kada se bude pravila naredna stranica, dovoljno je navesti:

> „Primeniti dizajn iz `SMERNICE_DIZAJNA_OPERATIVNOG_PORTALA.md`. Koristiti iste boje, tipografiju, KPI kartice, panele, filtere, dugmad, tabele i statusne oznake kao na stranici Otvoreni nalozi. CSS izolovati pod jednim wrapper-om, koristiti inline SVG ikonice i sačuvati svu postojeću EJS/JS funkcionalnost. Dizajn treba da bude ozbiljan, administrativan, moderan i prilagođen svakodnevnom radu operatera.“

**Izvor vrednosti:** smernice su izvedene iz CSS-a stranice „Otvoreni nalozi“. Generički `.portal-*` primeri predstavljaju predložak za buduće ekrane, ne tvrdnju da te klase već postoje u projektu.
