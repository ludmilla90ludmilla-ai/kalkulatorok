# Kalkulátorok

Böngészőben futó könyvelői számolóeszközök a [viktoriawp.eu](https://viktoriawp.eu/) arculatában.
Nincs build, nincs függőség, nincs szerveroldal — minden fájl duplakattra megnyílik, és a beírt
adatok nem hagyják el a gépet.

**Élő változat:** https://ludmilla90ludmilla-ai.github.io/kalkulatorok/

## Tartalom

| Fájl | Mit csinál |
|---|---|
| [`index.html`](index.html) | Gyűjtő nyitóoldal, innen nyílnak a kalkulátorok |
| [`ber-kalkulator/index.html`](ber-kalkulator/index.html) | Bér- és jövedelemkalkulátor 2026 |
| [`atalanyado-kalkulator/index.html`](atalanyado-kalkulator/index.html) | Átalányadó-kalkulátor 2026 |
| [`assets/szja2026.js`](assets/szja2026.js) | A bérszámítás motorja — a felülettől független, tesztelhető |
| [`assets/atalanyado2026.js`](assets/atalanyado2026.js) | Az átalányadó motorja; a közös kedvezménykereteket az `szja2026.js`-ből veszi |
| [`assets/viktoriawp.css`](assets/viktoriawp.css) | Az arculati CSS, változtatás nélkül |
| [`teszt.html`](teszt.html) | Ellenőrző lap a bérmotorhoz; megnyitáskor lefut |
| [`teszt-atalanyado.html`](teszt-atalanyado.html) | Ellenőrző lap az átalányadó-motorhoz |
| [`ikonok/index.html`](ikonok/index.html) | Ikontár: a bejegyzések kiemelt képeinek előnézete és letöltése |
| [`ikonok/LEIRAT.md`](ikonok/LEIRAT.md) | Az ikontár részletes leirata: szabványok, rács, buktatók |
| [`assets/ikonok/`](assets/ikonok/) | Az ikonok SVG-ben, mellettük a kész PNG-k |

## Bér- és jövedelemkalkulátor 2026

Két irányban számol:

- **Bruttóból nettót** — havi rendszeres és nem rendszeres jövedelemből.
- **Nettóból bruttót** — megadott kifizetendő összeghez keresi meg a szükséges bruttót
  (felező kereséssel, 1 Ft pontossággal, ugyanazzal a motorral, ezért a két irány nem tud
  ellentmondani egymásnak).

Kezelt adóalap-kedvezmények, a törvényi érvényesítési sorrendben:

1. anyák kedvezménye — NÉTAK, három-, illetve kétgyermekes anyák (teljes szja-mentesség),
   30 év alatti anyák (havi keretig)
2. 25 év alatti fiatalok kedvezménye
3. személyi kedvezmény
4. első házasok kedvezménye
5. családi kedvezmény — a fel nem használt része **családi járulékkedvezményként** a
   társadalombiztosítási járulékból, annak erejéig

### 2026-os értékek

| Tétel | Érték |
|---|---|
| Személyi jövedelemadó | 15% |
| Társadalombiztosítási járulék | 18,5% |
| Szociális hozzájárulási adó | 13% |
| Minimálbér | 322 800 Ft |
| Személyi kedvezmény | 107 600 Ft/hó (a minimálbér harmada) |
| 25 év alatti fiatalok / 30 év alatti anyák havi kerete | 715 765 Ft |
| Első házasok kedvezménye | 33 335 Ft/hó |
| Családi kedvezmény kedvezményezett eltartottanként | 1 eltartott: 133 340 Ft · 2: 266 660 Ft · 3 vagy több: 440 000 Ft |
| Tartósan beteg eltartott után | +133 340 Ft/hó |

Minden összeg egy helyen, az [`assets/szja2026.js`](assets/szja2026.js) tetején lakik —
évváltáskor csak ezeket kell átírni, és a `teszt.html` várt értékeit hozzáigazítani.

### Amit nem tud

Munkaviszonyban álló, biztosított magánszemélyre számol. Nem kezeli a saját jogú nyugdíjas
munkavállalót, a szociális hozzájárulási adó kedvezményeit (pl. munkaerőpiacra lépők),
az egyszerűsített foglalkoztatást, az önálló tevékenységet és a nem egész hónapos
jogviszonyokat. Tájékoztató jellegű: nem helyettesíti a bérszámfejtést.

## Átalányadó-kalkulátor 2026

Átalányadózó egyéni vállalkozó **egész évi** adóját és járulékát számolja. Azért éves, mert
ennél az adózási módnál a hónapok nem függetlenek egymástól:

- az **adómentes rész** (az éves minimálbér fele) nem havi keret, hanem az év elejétől
  göngyölítve fogy — a bevétel eloszlása tehát megváltoztatja az éves adót is;
- a **járulékalap negyedévente** áll össze: a negyedév végéig göngyölt adóalapból levonjuk,
  amit a korábbi negyedévek már lekötöttek, elosztjuk hárommal, és ez lesz a negyedév
  mindhárom hónapjának alapja — de legalább a minimumalap.

Alapesetben egyetlen havi bevételt kell megadni (minden hónapra ugyanaz); a *„A havi bevételek
eltérnek"* kapcsolóval mind a 12 hónap külön írható. Az eredménykártya éves összesítést mutat,
alatta kinyitható a hónapról hónapra bontás.

Az adóalap-kedvezmények ugyanazok és ugyanabban a sorrendben, mint a bérkalkulátorban — a
kereteket és a családi kedvezmény sávjait a motor közvetlenül az
[`assets/szja2026.js`](assets/szja2026.js)-ből veszi, hogy a két kalkulátor ne tudjon
kettéválni.

### 2026-os értékek

| Tétel | Érték |
|---|---|
| Költséghányad | 45% általános · 80% a felsorolt tevékenységek · 90% kizárólag kiskereskedelem |
| Adómentes jövedelemrész | 1 936 800 Ft/év (az éves minimálbér fele), göngyölítve |
| Bevételi értékhatár | 38 736 000 Ft (az éves minimálbér tízszerese) · kiskereskedelemnél 193 680 000 Ft |
| Garantált bérminimum | 373 200 Ft/hó |
| Minimálbér | 322 800 Ft/hó |
| Szocho minimumalapja főállásúnál | a minimum járulékalap 100%-a (2025-ben még 112,5% volt) |
| Megváltozott munkaképességű vállalkozó szocho-kedvezménye | a minimálbér kétszereséig, 645 600 Ft/hó |

A minimálbér, a kedvezménykeretek és a családi kedvezmény sávjai az `szja2026.js` tetejéről
jönnek; az átalányadóra jellemző konstansok az
[`assets/atalanyado2026.js`](assets/atalanyado2026.js) tetején laknak.

### Amit nem tud

Azt feltételezi, hogy a vállalkozás jellege, a járulékalap és a kedvezmények az egész évben
változatlanok — csak a bevétel bontható hónapokra. Nem kezeli az áfát, a tevékenységváltást,
a szünetelést, a táppénzes és egyéb kieső időszakokat, a nem átalányadós jövedelmeket, sem az
átalányadózásból év közben történő kilépést. Tájékoztató jellegű: nem helyettesíti a könyvelést.

## Beágyazás a honlapba

A kalkulátor `?embed=1` paraméterrel fejléc, hero és lábléc nélkül, átlátszó háttérrel
jelenik meg — így az Elementor HTML-widgetjébe illesztve a honlap saját kerete marad a keret.

```html
<iframe id="ber-kalkulator"
        src="https://ludmilla90ludmilla-ai.github.io/kalkulatorok/ber-kalkulator/?embed=1"
        title="Bér- és jövedelemkalkulátor 2026"
        style="width:100%;border:0;display:block;" height="1300"></iframe>
<script>
  window.addEventListener('message', function (esemeny) {
    if (esemeny.data && esemeny.data.tipus === 'kalkulator-magassag') {
      document.getElementById('ber-kalkulator').style.height = esemeny.data.magassag + 'px';
    }
  });
</script>
```

Az átalányadó-kalkulátorhoz ugyanez, más `id`-vel és `src`-vel:

```html
<iframe id="atalanyado-kalkulator"
        src="https://ludmilla90ludmilla-ai.github.io/kalkulatorok/atalanyado-kalkulator/?embed=1"
        title="Átalányadó-kalkulátor 2026"
        style="width:100%;border:0;display:block;" height="1600"></iframe>
```

A fogadó script közös: az üzenet `tipus`-a mindegyik kalkulátornál `kalkulator-magassag`, csak
a `getElementById`-t kell a megfelelő `id`-re állítani (vagy egyszerre több iframe-et kezelni).

A scriptet érdemes bent hagyni. A kalkulátor magától küldi a magasságát, valahányszor a
tartalom mérete változik, így az iframe pontosan akkora lesz, amekkora kell. Nélküle a fix
`height` marad érvényben — az asztali, kétoszlopos elrendezéshez ~1300 px elég, de mobilon
egy oszlopba rendeződik és ~2850 px kell, különben elvágja az alját.

**Lazy load – hibakereséshez:** a viktoriawp.eu-n a Smush lazy loadja átírja az `iframe`-et
`src="about:blank"` + `data-src` + `data-load-mode="0"` alakúra, és `0` módban nem az `src`-t
állítja vissza, hanem `contentWindow.location.replace()`-szel navigál. Emiatt az `iframe.src`
akkor is `about:blank` marad, ha a kalkulátor rendben betöltődött — ebből tehát nem lehet
következtetni. Az működik-e kérdésre a `contentDocument` ad választ: ha kereszt-origin
(nem olvasható), akkor betöltött.

## Ikontár

A bejegyzések kiemelt képe kalkulátoronként egy saját ikon, azonos felépítésű képen:
világoskék (`#F0F0FF`) háttér, balra az ikon, mellette a kalkulátor neve Playfair Displayjel,
éjkékkel. A méret **1920×667** — ez a honlap kiemelt képeinek szabványa; a kategórialistában
az Elementor vágás nélkül, arányosan kicsinyíti 375×130-ra.

**Élő cím:** https://ludmilla90ludmilla-ai.github.io/kalkulatorok/ikonok/ ·
**Részletes leirat:** [`ikonok/LEIRAT.md`](ikonok/LEIRAT.md)

Az oldal minden ikonnál mutatja a bannert, alatta a kicsinyített, kártyaméretű előnézetet, és
egy gombbal letölthető a kész PNG. A képet a böngésző rajzolja canvasra — a név a betöltött
Playfair Displayjel készül —, tehát nem kell képszerkesztő.

### Önálló ikon, név nélkül

Ugyanott letölthető a puszta ikon is, **512×512**-ben, két változatban:

| Fájl | Mikor |
|---|---|
| `<nev>-512.png` | világoskék (`#F0F0FF`) háttérrel — a bannerekkel egy család |
| `<nev>-512-atlatszo.png` | átlátszó háttérrel, tetszőleges alapra |

Az átlátszó változatban a kijelzőből kivágott „Ft" és a billentyűk belseje is átlátszó, ezért
**világos alapra való**. Sötét háttéren a „Ft" eltűnne — oda a világoskék hátterű változatot
használd.

### Új ikon felvétele

1. Rajzold meg az ikont `assets/ikonok/<nev>.svg` néven. Négyzetes `viewBox`, **szöveg nélkül**:
   az SVG képként rajzolva nem tud webfontot betölteni, ezért a benne lévő betűk mértani
   formák legyenek (lásd a „Ft"-et a `ber-kalkulator.svg`-ben).
2. Vedd fel egy sorral az `ikonok/index.html` tetején lévő `IKONOK` tömbbe:

   ```js
   { fajl: 'afa-kalkulator.svg', nev: 'Áfakalkulátor', kimenet: 'afa-kalkulator-1920x667.png' }
   ```

3. Nyisd meg az ikontárat, töltsd le a bannert és a két négyzetes változatot, és tedd be
   őket az `assets/ikonok/` mappába is, hogy a repóból is elérhetők legyenek.

**Az ikonok stílusa:** éjkék (`#02023B`) kontúr, egyetlen tömör kiemelt elem, semmi árnyék,
semmi átmenet, második szín nélkül. A vonalvastagságot úgy válaszd, hogy a kártyaméretű,
kb. 62 px-es változat se essen szét.

## Ellenőrzés

Mindkét motorhoz tartozik egy ellenőrző lap; megnyitáskor lefutnak, és a lap tetején látszik,
hány ellenőrzés futott le és hány bukott meg (a böngészőfül címében is: `✓` vagy `✕`).

[`teszt.html`](teszt.html) — a bérmotor. Kézzel kiszámolt eseteket futtat (minimálbér, 25 év
alatti a keret alatt és fölött, egy-, két- és háromgyermekes családi kedvezmény, a családi
járulékkedvezménybe átforduló eset, tartósan beteg eltartott, NÉTAK, megosztott kedvezmény),
plusz 400 véletlen bemeneten ellenőrzi, hogy a nettóból visszaszámolt bruttó visszavezetve
1 Ft-on belül ugyanazt a nettót adja.

[`teszt-atalanyado.html`](teszt-atalanyado.html) — az átalányadó-motor. A konstansokon és a
kézzel számolt eseteken túl **kereszt-ellenőrzést** is végez: öt forgatókönyv a Novitax
2026-os átalányadó-kalkulátorából (`novitax.hu/kalkulatorok/2026Atalany/evat26.html`)
kiolvasott értékeivel — főállású mindkét minimumalappal, főállás melletti, nyugdíjas,
kedvezményekkel és anélkül. Ezekben az éves összesítők soronként egyeznek. Mellette 200
véletlen évre ellenőrzi, hogy a havi értékek összege az éves, és hogy a bevételből a
közterheket levonva pontosan a „marad" jön ki.

**Figyelem az eltartottak megadására:** a Novitaxnál a „kedvezményezett" és a „figyelembe
vehető" eltartott két külön, összeadódó szám; nálunk az `eltartott` a teljes létszám, a
kedvezményezettekkel együtt. Összehasonlításkor a Novitaxban `felt = 0`-t kell megadni.

## Közzététel

A GitHub Pages a `main` ágat követi a gyökérből, ezért a közzététel egyetlen lépés:

```bash
git push origin main
```
