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
| [`kata-kalkulator/index.html`](kata-kalkulator/index.html) | KATA-kalkulátor 2027 (a 2026. októberi törvénytervezet alapján) |
| [`assets/szja2026.js`](assets/szja2026.js) | A bérszámítás motorja — a felülettől független, tesztelhető |
| [`assets/atalanyado2026.js`](assets/atalanyado2026.js) | Az átalányadó motorja; a közös kedvezménykereteket az `szja2026.js`-ből veszi |
| [`assets/kata2027.js`](assets/kata2027.js) | A KATA motorja; önálló, más motortól nem függ |
| [`assets/viktoriawp.css`](assets/viktoriawp.css) | Az arculati CSS, változtatás nélkül |
| [`teszt.html`](teszt.html) | Ellenőrző lap a bérmotorhoz; megnyitáskor lefut |
| [`teszt-atalanyado.html`](teszt-atalanyado.html) | Ellenőrző lap az átalányadó-motorhoz |
| [`teszt-kata.html`](teszt-kata.html) | Ellenőrző lap a KATA-motorhoz |
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

Alapesetben csak az irányválasztó és a két összegmező látszik; a kedvezmények, a családi
kedvezmény és az éves összesítő **összecsukható szakaszokban** van. Minden becsukott szakasz
fejléce kiírja az aktuális beállítást („25 év alattiak, személyi", „2 kedvezményezett
eltartott, megosztva", „Nincs"), hogy a helyspórolás ne járjon információvesztéssel.
Nyomtatáskor mind kinyílik, majd visszazáródik.

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

Alapesetben egyetlen havi bevételt kell megadni (minden hónapra ugyanaz), és ehhez jön a
költséghányad — más nem is látszik. Minden további beállítás **összecsukható szakaszban** van:
havi bevételek, biztosítási jogviszony, kedvezmények, családi kedvezmény. Az eredménykártya
éves összesítést mutat, alatta kinyitható a hónapról hónapra bontás.

**A becsukott szakasz fejléce mindig kiírja az aktuális beállítást** („Főállású · garantált
bérminimum", „25 év alattiak, személyi", „Nincs"). Ez nem díszítés: a vállalkozás jellege
nullázhatja a szochót és a járulékot, tehát ha ez láthatatlanul dőlne el, rossz számot kapna,
aki nem nyitja ki a szakaszt.

A *Havi bevételek* szakasznál maga a kinyitás a kapcsoló: csukva minden hónapra a közös
összeggel számolunk, nyitva a 12 mező értékével. Nyitáskor a mezők a közös összegről indulnak,
így a kinyitás önmagában sosem változtatja meg az eredményt.

Nyomtatáskor minden szakasz automatikusan kinyílik, majd visszazáródik — különben a
beállítások lemaradnának a papírról.

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

## KATA-kalkulátor 2027

Az új KATA (a kisadózó egyéni vállalkozók tételes adója) **egész évi** terheit számolja,
főfoglalkozású és nem főfoglalkozású kisadózóra. A szabályok a törvényjavaslat
[2026. október 6-án társadalmi egyeztetésre bocsátott szövegéből](https://kormany.hu/dokumentumtar/tarsadalmi-egyeztetes-a-kisadozo-egyeni-vallalkozok-teteles-adojarol-szolo-torvenyjavaslatrol)
származnak — **tervezet**, az elfogadott törvény eltérhet. Ezt a kalkulátor a beágyazott módban
is látható sávban jelzi.

Éves összegekből számol, mert a KATA-ban minden teher vagy havi fix összeg, vagy az éves
bevételből adódik. Alapesetben két összeget kell megadni — a cégektől és a magánszemélyektől
kapott bevételt — és a jogállást. Összecsukható szakaszban van az adóalanyiság időtartama
(katás és mentes hónapok), a legnagyobb megrendelő és a volt munkáltató, a költség, és a
8. § (5) értelmezése.

### A számítás

| Tétel | Szabály | Tervezet |
|---|---|---|
| Tételes adó | havi 100 000 Ft főfoglalkozásúnak, 50 000 Ft nem főfoglalkozásúnak, minden megkezdett hónapra | 7. § (1)–(2) |
| Mentes hónap | amelyik egészében táppénz, CSED, GYED, ápolási díj stb., vagy bevétel nélküli szünetelés | 7. § (8)–(9) |
| Keretösszeg | 22 000 000 Ft; ha nem minden hónapra kell tételes adót fizetni, a fizetős hónapok tizenkettede | 7. § (4)–(5) |
| Különadó | a keret feletti bevételrész 40%-a; az adóalanyiság nem szűnik meg | 7. § (4) |
| Kiegészítő adó | a cégektől (kifizetőtől) kapott bevétel 15%-a, csökkentve az évben fizetendő tételes adóval | 8. § (1)–(3) |
| Ellátások alapja | 317 000 Ft/hó a főfoglalkozásúnak; a nem főfoglalkozású nem biztosított | 10. § (1)–(2) |
| Jövedelemigazolás | a bevétel 60%-a | 10. § (4) |

A kiegészítő adónak van egy küszöbe: amíg a céges bevétel 15%-a nem éri el az éves tételes
adót, nincs pluszteher — egész éves főfoglalkozásúnál ez 8 000 000 Ft, nem főfoglalkozásúnál
4 000 000 Ft céges bevétel.

### A 8. § (5) — választható értelmezés

A tervezet szerint a keret feletti bevételrészre nem jár kiegészítő adó, de nem rendezi, hogy
vegyes bevételnél ez a céges vagy a magánszemélyektől származó részt csökkenti-e. A kalkulátor
mindhármat tudja, alapból az óvatosat:

| Értelmezés | A 15% alapja | 10 M magán + 20 M céges esetén |
|---|---|---|
| Óvatos | a céges bevétel, legfeljebb a keretig | 1 800 000 Ft |
| Arányos | a céges bevétel × keret / összes bevétel | 1 000 000 Ft |
| Kedvező | a céges bevétel − a keret feletti rész | 600 000 Ft |

Ha csak céges bevétel van, vagy a bevétel a kereten belül marad, a három egybeesik — ilyenkor a
kalkulátor nem is hozza szóba. Ha eltérnek, a megjegyzésben mindhárom összeg megjelenik.

### Figyelmeztetések

Csak olyat mond, ami a tervezet szövegéből következik, és hivatkozza a paragrafust: a keret
túllépése, az 50%-os megrendelői szabály (az adóalanyiság az év végén megszűnik — 5. § (1) g)),
a volt munkáltatónak számlázás (a bevétel előtti nappal megszűnik — 5. § (1) f)), a nem
főfoglalkozású biztosításának hiánya, és ha a 8. § (5) értelmezése számít.

### Amit nem tud

Azt feltételezi, hogy a jogállás (főfoglalkozású vagy nem) az egész évben azonos. Nem kezeli az
áfát, a foglalkoztatottak utáni közterheket, a 2026. december 31-én már katás vállalkozók átmeneti
szabályait (a régi KATA 2027-ben havi 75 000 Ft-tal fut tovább), az adóalanyiság év közbeni
megszűnését, és a 2028-tól a minimálbérhez kötött tételt. Tájékoztató jellegű: nem helyettesíti a
könyvelést.

**Ha a törvényt elfogadják:** a számok az [`assets/kata2027.js`](assets/kata2027.js) tetején,
paragrafus-hivatkozással laknak. Az elfogadott szöveggel össze kell vetni őket, a 8. § (5)-öt
különösen, és ha eldől az értelmezés, a választót meg lehet szüntetni.

## Beágyazás a honlapba

A kalkulátor `?embed=1` paraméterrel fejléc, hero és lábléc nélkül, átlátszó háttérrel
jelenik meg — így az Elementor HTML-widgetjébe illesztve a honlap saját kerete marad a keret.

**Mindhárom rész kell**, és a bejegyzésenként eltérő `id`-nek **mind a három helyen** ugyanannak
kell lennie. Az átalányadó-kalkulátorhoz:

```html
<style>
  .elementor-widget:has(#atalanyado-kalkulator) { align-self: stretch; }
</style>

<iframe id="atalanyado-kalkulator"
        src="https://ludmilla90ludmilla-ai.github.io/kalkulatorok/atalanyado-kalkulator/?embed=1"
        title="Átalányadó-kalkulátor 2026"
        style="display:block;border:0;width:100%;" height="1600"></iframe>

<script>
  window.addEventListener('message', function (esemeny) {
    if (esemeny.data && esemeny.data.tipus === 'kalkulator-magassag') {
      document.getElementById('atalanyado-kalkulator').style.height = esemeny.data.magassag + 'px';
    }
  });
</script>
```

A bérkalkulátorhoz ugyanez, `ber-kalkulator` azonosítóval, `ber-kalkulator/?embed=1` címmel és
`height="1200"` tartalékkal. A KATA-kalkulátorhoz `kata-kalkulator` azonosítóval,
`kata-kalkulator/?embed=1` címmel, „KATA-kalkulátor 2027” címkével és `height="1700"`
tartalékkal (832 px-en csukott szakaszokkal ~1640 px).

### Miért kell a `<style>`

Az Elementor konténerei flexboxok, és a bejegyzés-sablonban `align-items: center` van rajtuk.
Flexboxban ez azt jelenti, hogy az elemek **nem nyúlnak ki** a sáv szélességére, hanem a
tartalmukhoz zsugorodnak. Egy `<iframe>` belső (intrinsic) szélessége a HTML-szabvány szerint
**300 px**, és a `width:100%` sem segít, mert a 100% is ehhez a 300 px-hez igazodik — az
eredmény egy 300 px-es, használhatatlanul keskeny kalkulátor.

Ez csak akkor jön elő, ha a bejegyzés tartalma **kizárólag** az iframe. Ha van fölötte egy
bekezdés szöveg, akkor annak a sorhossza feszíti szét az oszlopot, és a hiba elrejtőzik — a
bérkalkulátor bejegyzése sokáig pont ezért működött.

Az `align-self: stretch` a widgetre a hiba gyökerét szünteti meg: felülírja a konténer
`align-items: center`-jét, így az elem a sáv teljes szélességét felveszi. Ha a téma valaha nem
flexbox lesz, a szabály egyszerűen hatástalan — nem tud elrontani semmit.

**Amit ne csinálj:** `min-width`-tel is ki lehetne nyitni, de az *erősebb* a konténer
`max-width`-jénél, ezért egy túl nagyra állított érték vízszintesen túllógatja az egész lapot.

### Meddig szélesedik

A bejegyzés-sablon tartalomsávja **832 px** széles (`.e-con-inner { max-width: 832px }`), és a
konténer az ennél szélesebb iframe-et levágja — negatív margós „kitörés" sem segít. Ezért
**mindkét kalkulátor 780 px fölött** vált kétoszlopos elrendezésre, nem 900 fölött: hogy a
832 px-es sávban is kettő legyen. A 780–1023 px közötti sávban szűkebb belső margóval és egy
fokkal kisebb betűvel rajzolódnak, különben a hosszú tételnevek fele két sorba törne.

Ha a sáv valaha szélesebb lesz, ez magától rendbe jön — a szűkítés csak 1023 px-ig él.

### A script nem elhagyható

A kalkulátor magától küldi a magasságát, valahányszor a tartalom mérete változik, így az
iframe pontosan akkora lesz, amekkora kell. A `height` attribútum csak tartalék az első
pillanatra, illetve arra az esetre, ha a script nem fut le.

**A leggyakoribb hiba**, hogy a snippetet a másik kalkulátorról másolják, és a scriptben
bennmarad a régi `id`. Ilyenkor a `getElementById` `null`-t ad, a kezelő elszáll, és az iframe
örökre a tartalék magasságon marad — a kalkulátor alját pedig levágja. Ellenőrizni így lehet
a böngésző konzoljában:

```js
document.getElementById('atalanyado-kalkulator').style.height
```

Ha ez üres marad néhány másodperc után is, akkor a script nem talál rá az iframe-re.

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

**A név legyen rövid.** A bejegyzéslistában a kártya a bannerből csak a középső 1202 px-et
mutatja, a széleit levágja — a hosszabb felirat kilóg belőle, és az ikont is nagyobbnak
mutatja a többinél. Ezért „Átalányadó" a felirat, nem „Átalányadó-kalkulátor". A pontos
számokat lásd: [`ikonok/LEIRAT.md`](ikonok/LEIRAT.md).

## Ellenőrzés

Mindhárom motorhoz tartozik egy ellenőrző lap; megnyitáskor lefutnak, és a lap tetején látszik,
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

[`teszt-kata.html`](teszt-kata.html) — a KATA-motor. A tervezetből vett konstansok, az
allampapirkalkulator.hu tervezetelemzésének példái kézzel újraszámolva (14 M vegyes, 20 M és
28 M csak céges, nem főfoglalkozású 6 M), a küszöbök, a 8. § (5) három értelmezése egy vegyes,
kereten felüli esetre, az időarányos keret, a mentes hónapok és a figyelmeztetések. Mellette 200
véletlen éven ellenőrzi, hogy a közterhek a tételek összege, az adózott jövedelem egyezik, nincs
negatív adó, és az óvatos ≥ arányos ≥ kedvező sorrend mindig áll. Hivatalos kalkulátor, amivel
kereszt-ellenőrizni lehetne, a tervezethez még nincs.

## Közzététel

A GitHub Pages a `main` ágat követi a gyökérből, ezért a közzététel egyetlen lépés:

```bash
git push origin main
```
