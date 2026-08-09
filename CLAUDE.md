# Kalkulátorok — munkamenet-jegyzet

Könyvelői számolóeszközök a [viktoriawp.eu](https://viktoriawp.eu/) arculatában. Ez a fájl
arról szól, **hogyan kell itt dolgozni**; hogy melyik kalkulátor mit tud, az a
[`README.md`](README.md)-ben van.

## Alapelvek

- **Nincs build, nincs függőség, nincs csomagkezelő.** Klasszikus `<script src>`, globális
  névtér-objektum, ES5 stílus (`var`, IIFE, `'use strict'`). Ne vezess be `import`-ot,
  bundlert, npm-et vagy keretrendszert.
- **Magyar azonosítók** végig — a változó-, függvény- és mezőnevek is (`bevetel`, `frissit`,
  `honapKedvezmenyei`). A kommentek is magyarul vannak, és azt magyarázzák, **miért**, nem azt,
  hogy mit.
- **Motor és felület szét van választva.** A számítás `assets/<tema><ev>.js`-ben él, DOM-ot nem
  ismer, és egy mellékhatás nélküli `szamol(be)`-t exportál. Így ugyanaz a fájl fut a
  tesztlapról is. Ha egy számítás bekerül az oldal `<script>`-jébe, az hiba.
- **Az `assets/viktoriawp.css` érinthetetlen** — az arculati alap, a `viktoriawp-stilus`
  skillből származik. Oldalspecifikus stílus az adott lap saját `<style>` blokkjába megy,
  `kalk-` előtaggal.

## Felépítés

| Réteg | Fájlok |
|---|---|
| Motorok | `assets/szja2026.js`, `assets/atalanyado2026.js` |
| Felületek | `ber-kalkulator/index.html`, `atalanyado-kalkulator/index.html` |
| Tesztek | `teszt.html`, `teszt-atalanyado.html` |
| Gyűjtőoldal | `index.html` |
| Ikontár | `ikonok/index.html`, `ikonok/LEIRAT.md`, `assets/ikonok/` |

**Az `atalanyado2026.js` függ az `szja2026.js`-től**: onnan veszi a közös kedvezménykereteket
(személyi, 25 év alattiak, első házasok), a családi kedvezmény sávjait és a
`csaladiKedvezmenyOsszege()`-t, hogy a két kalkulátor ne tudjon kettéválni. Ezért minden lap,
ami az átalányadó-motort használja, **előbb az `szja2026.js`-t tölti be**.

Az évfüggő számok a motorok **tetején**, egy blokkban laknak, kommentelt eredettel. A
származtatott értékek képlettel készülnek (`SZEMELYI_KEDVEZMENY = Math.round(MINIMALBER/300)*100`),
nem beírva. Évváltáskor ezeket kell átírni, és a tesztlapok várt értékeit hozzáigazítani.

## Új kalkulátor felvétele

1. `assets/<tema><ev>.js` — motor a fenti minta szerint, JSDoc-os bemeneti szerződéssel.
2. `<uj-kalkulator>/index.html` — a `ber-kalkulator/index.html`-ből másolva. Változtatás
   nélkül átvihető belőle: a `?embed=1` mód, a magasságjelzés, a formázók (`ft`, `szamKent`,
   `ertek`, `tagol`), a másolás- és nyomtatásgomb, a fejléc/lábléc, a `kalk-jogi` lábjegyzet.
3. Tesztlap a `teszt.html` keretével.
4. Kártya az `index.html`-ben, a „Készül" kártya **elé**.
5. Ikon — lásd [`ikonok/LEIRAT.md`](ikonok/LEIRAT.md), és a `kalkulator-ikonok` skillt.
6. README: Tartalom-táblázat sor, kalkulátorszakasz, iframe-snippet.

## Beágyazás a honlapba

Minden kalkulátor ismeri a `?embed=1` paramétert: elrejti a `kalk-csak-onalloan` elemeket
(fejléc, hero, lábléc), átlátszó hátteret ad, és `postMessage`-dzsel küldi a magasságát a
szülő oldalnak `{ tipus: 'kalkulator-magassag', magassag }` alakban. A fogadó script közös,
a snippet a README-ben van.

**A magasságot a `body`-ból kell mérni, nem a `documentElement`-ből** — utóbbi sosem kisebb az
iframe belmagasságánál, ezért egy túl nagy érték beragadna.

## Futtatás és ellenőrzés

A gépen **nincs Node és nincs működő Python** (a `python.exe` a Store-os csonk), és nincs
rasterizáló sem. Ami van:

- A kalkulátorlapok és a tesztlapok **duplakattra megnyílnak** (`file://`), mert csak relatív
  CSS-t és JS-t töltenek.
- Az **ikontárhoz kell HTTP** — `fetch`-csel olvassa be az SVG-t. Ilyenkor egy néhány soros
  PowerShell `HttpListener` szolgál ki a scratchpadből; a `kalkulator-ikonok` skill
  `references/generalas.md`-je tartalmazza a `PUT`-ot is tudó változatot, amivel a böngészőben
  rajzolt PNG egyenesen a lemezre kerül.
- A Böngésző panel a `localhost`-ot csak `preview_start`-on keresztül nyitja meg; ehhez
  `.claude/launch.json` kell a **munkakönyvtárban** (nem ebben a repóban), `url`-lel megadva,
  ha a kiszolgáló már fut.

**Motorváltoztatás után mindkét tesztlapot futtasd** — a böngészőfül címében `✓` vagy `✕`
jelzi az eredményt, a lap tetején pedig a darabszám.

## A Novitax mint referencia

A kalkulátorok mintája a Novitax megfelelő eszköze. Az oldalaik iframe-esek, a valódi motor
egy külön JS, ami a beépített böngészőből `fetch`-csel kiolvasható, a lap pedig JS-ből
vezérelhető (`CheckEves()`, `CalcHo('01')`) — így soronként összevethető a miénkkel.

| Téma | Cím |
|---|---|
| Bér 2026 | `novitax.hu/kalkulatorok/2026Berkalktax/tax26.html` |
| Átalányadó 2026 | `novitax.hu/kalkulatorok/2026Atalany/evat26.html` + `evat26_251215.js` |

Két dolgot érdemes tudni róluk:

- **Az eltartottak megadása másképp működik.** Náluk a „kedvezményezett" és a „figyelembe
  vehető" eltartott két külön, **összeadódó** szám; nálunk az `eltartott` a teljes létszám, a
  kedvezményezettekkel együtt. Összehasonlításkor a Novitaxban `felt = 0` kell.
- **A bérkalkulátoruk hibás az utolsó sorban** (`brjov3` nincs definiálva), ezért náluk az
  „Éves kifizetendő" 2026-os mezője üresen marad. Nálunk ez helyesen jelenik meg.

A kereszt-ellenőrzés eredményei be vannak égetve a tesztlapokba, tehát egy jövőbeli elrontás
kibukik anélkül, hogy újra meg kellene nyitni a Novitaxot.

## Közzététel

A GitHub Pages a `main` ágat követi a gyökérből, ezért a deploy egyetlen lépés:

```bash
git push origin main
```

Élő cím: https://ludmilla90ludmilla-ai.github.io/kalkulatorok/

A Pages **beállításait** (ág, mappa) böngészőből kell intézni — a `gh` API ehhez nem működik,
azt a felhasználó teszi meg. Ugyanígy az övé a WordPress-oldal: a bejegyzés létrehozása a
*Kalkulátorok* kategóriában, az iframe beillesztése az „Egyéni HTML" blokkba, és a kiemelt kép
feltöltése a médiatárba.

**A commit-üzenetek magyarul vannak**, jelen idejű, tárgyilagos megfogalmazással.

## A honlapról, amit itt tanultunk

- A **Smush lazy loadja** (lazysizes) `src="about:blank"` + `data-src` + `data-load-mode="0"`
  alakban adja ki az iframe-eket, és `0` módban nem az `src`-t állítja, hanem
  `contentWindow.location.replace()`-szel navigál. Ezért az `iframe.src` **örökre
  `about:blank` marad, miközben a tartalom rendben betöltődik** — ne ebből ítéld meg. Helyes
  ellenőrzés: a `contentDocument` kereszt-origin lett-e.
- A **LiteSpeed a beágyazott `<script>`-et `data:text/javascript;base64` forrásúvá alakítja**,
  ezért a lapforrásban hiába keresed a szöveget — attól még ott van és fut.
- Süti-sáv: **CookieYes** fut az oldalon, modális, a gördítést is blokkolja.
