# Ikontár – leirat

Ez a dokumentum azért készült, hogy hónapokkal később is folytatható legyen a munka: leírja,
mi az ikontár, milyen szabályok szerint készülnek a képek, és hogyan kerül be egy új ikon.

**Élő oldal:** https://ludmilla90ludmilla-ai.github.io/kalkulatorok/ikonok/

---

## 1. Mire való

A honlapon minden kalkulátor egy-egy **bejegyzés** a *Kalkulátorok* kategóriában
(`viktoriawp.eu/category/kalkulatorok/`). Minden bejegyzésnek van kiemelt képe. Stockfotó
helyett kalkulátoronként egy **saját ikon** kerül rá, azonos felépítésű képen — így a
kategórialista egységes, és ránézésre látszik, melyik kalkulátor melyik.

Az ikontár oldala nem publikus tartalom, hanem **munkaeszköz**: megmutatja a képeket, és
letölthetővé teszi őket. A honlapra a letöltött PNG kerül fel, nem az oldal.

---

## 2. Fájlok

| Fájl | Szerep |
|---|---|
| `ikonok/index.html` | az ikontár oldala: előnézet + letöltés |
| `ikonok/LEIRAT.md` | ez a dokumentum |
| `assets/ikonok/<nev>.svg` | az ikon vektoros forrása — ez az egyetlen kézzel szerkesztett fájl |
| `assets/ikonok/<nev>-1920x667.png` | a bejegyzés kiemelt képe |
| `assets/ikonok/<nev>-512.png` | önálló ikon, világoskék háttérrel |
| `assets/ikonok/<nev>-512-atlatszo.png` | önálló ikon, átlátszó háttérrel |

A PNG-k a repóban is benne vannak, tehát nem kell megnyitni a generátort ahhoz, hogy valaki
hozzájusson egy képhez.

---

## 3. A képek szabványai

### Banner (kiemelt kép)

| Tulajdonság | Érték |
|---|---|
| Méret | **1920×667** px |
| Háttér | `#F0F0FF` (az arculati levendula) |
| Ikon | 320×320 px, függőlegesen középen |
| Térköz ikon és név között | 56 px |
| Név | Playfair Display 400, **104 px**, `#02023B` |
| Igazítás | az ikon és a név együtt, egy csoportként vízszintesen középen |

Az 1920×667 nem önkényes: ez a honlap kiemelt képeinek mérete. A kategórialistában az
Elementor **vágás nélkül**, arányosan kicsinyíti 375×130-ra — ezért kell a tartalomnak
kicsiben is olvashatónak maradnia. Az ikontár ezt a kicsinyített nézetet külön mutatja.

### Önálló ikon

| Tulajdonság | Érték |
|---|---|
| Méret | **512×512** px |
| Háttér | `#F0F0FF`, illetve átlátszó változatban semmi |
| Az ikon a vásznon | teljes méretben (a térközt maga az SVG tartalmazza) |

---

## 4. Vizuális szabályok

Az arculat a `viktoriawp-stilus` skillből jön, és két dolgot enged meg:

- **Éjkék** `#02023B` — a rajz színe.
- **Levendula** `#F0F0FF` — a háttér.

Semmi más. Konkrétan **tilos**: árnyék, színátmenet, második kiemelőszín, keret a kép körül,
nagybetűs felirat (a nagybetű az arculatban csak a gombokon van).

Az ikon felépítése:

- **kontúros rajz**, éjkék vonalakkal;
- **egyetlen tömör elem**, ami a kalkulátor témáját hordozza (a bérkalkulátornál a kijelző);
- a tömör elemből **kimaszkolva** a jellegadó jel (itt a „Ft"), hogy alatta a háttér látsszon.

Ez a hármas a recept: ha egy új ikon ezt követi, egy családba fog tartozni a többivel.

---

## 5. Az ikon szerkesztési rácsa

A `ber-kalkulator.svg` a minta. `viewBox="0 0 512 512"`, és a rajz ezt a rácsot használja:

| Elem | Koordináták | Vonal |
|---|---|---|
| A test | `x=128 y=64 w=256 h=384 rx=36` | kontúr, `stroke-width: 18` |
| A kijelző | `x=168 y=104 w=176 h=88 rx=14` | tömör |
| Billentyűk | 44×44, `rx=10`, oszlopok `x=168/234/300`, sorok `y=232/298/364` | kontúr, `stroke-width: 10` |

A rajz tényleges kiterjedése — a vonalvastagsággal együtt — `x: 119…393`, `y: 55…457`, vagyis
a magassága a vászon **78%-a**. Ezt az arányt érdemes tartani az új ikonoknál is: így minden
ikon ugyanakkorának *látszik* majd egymás mellett.

**A vonalvastagságok azért ilyenek**, mert a kategórialistában az ikon kb. 62 px-esre zsugorodik.
18-as fővonal ott ~2 px, a 10-es másodlagos vonal ~1,2 px — ez még nem esik szét. Vékonyabb
vonalakkal a kártyanézet elmosódna.

### A második ikon: `atalanyado-kalkulator.svg`

Naptár, mert ez a kalkulátor az egész évről szól. A rácsa:

| Elem | Koordináták | Vonal |
|---|---|---|
| Fűzőkarikák | `x=192` és `x=320`, `y=64…106` | kontúr, `stroke-width: 18`, kerek végződés |
| A test | `x=128 y=100 w=256 h=348 rx=36` | kontúr, `stroke-width: 18` |
| A fejléc | a test belső szélességében, `y=109…189`, felül `rx=27` | tömör, benne kimaszkolva a „%" |
| Sorok | `x=168…344`, `y=258/314/370` (az utolsó rövidebb) | kontúr, `stroke-width: 10` |

Kiterjedése `x: 119…393`, `y: 55…457` — **pixelre ugyanaz a lábnyom, mint a bérkalkulátoré**.
A test szélessége szándékosan egyezik a számológépével.

**Amiért mégsem folyik össze a kettő:** a felül kilógó két fűzőkarika és a teljes szélességű,
tömör fejlécsáv. A megkülönböztetés a sziluettből jön, nem a méretből — méretben épp hogy
egyezniük kell.

**Amiért nem szélesebb, pedig lehetne:** a bejegyzéslistában a kártya a bannerből csak a
középső **1202 px-et** mutatja (a széleit levágja). A szélesebb ikon és a hosszabb felirat
együtt kilógott ebből, és az ikon nagyobbnak is látszott a másiknál. Lásd a következő pontot.

**Foglalt jelek:** „Ft" a bérkalkulátoré, „%" az átalányadóé. Új ikonhoz olyan jelet válassz,
ami még nincs használatban — az áfakalkulátornak például a számla vagy blokk formája ad
elegendő karaktert, nem kell hozzá a „%".

### A név hossza számít

A bejegyzéslistában a kártya a **1920×667-es bannerből csak a középső 1202 px-et mutatja**,
a széleit levágja (`overflow: hidden`, a kép szélesebbre skálázódik a keretnél). Ami ezen
kívül esik, egyszerűen eltűnik — és a kilógó felirat azt a benyomást kelti, hogy az ikon
nagyobb a többinél.

Mérhető szabály: **az ikon és a név együtt ne legyen szélesebb ~1150 px-nél.** Az `IKONOK`
tömb `nev` mezőjébe ezért rövid címke való, nem a kalkulátor teljes neve:

| Név | A tartalom szélessége | Elfér? |
|---|---|---|
| „Bérkalkulátor" | 939 px | igen |
| „Átalányadó" | 815 px | igen |
| „Átalányadó-kalkulátor" | 1361 px | **nem**, mindkét szélén levágódik |

Nagyjából **50 px karakterenként** a 104 px-es Playfairrel, plusz ~300 px az ikonra és a
térközre. Kb. 17 karakternél hosszabb név már nem fér el. Ellenőrizni a legegyszerűbben a
kiírt PNG festékdobozának megmérésével lehet: a tartalomnak az `x: 366…1567` sávon belül
kell maradnia.

### Miért nincs szöveg az SVG-ben

Az SVG-t a böngésző **képként** rajzolja a vászonra, és ebben a módban nem tud webfontot
betölteni — egy `<text>` elem tartalék betűvel vagy sehogy jelenne meg. Ezért a „Ft" mértani
formákból (öt téglalapból) áll, egy `<mask>`-ban. Ha új ikonba betű kell, ugyanígy kell
megrajzolni, vagy görbévé alakítva beilleszteni.

---

## 6. Hogyan készülnek a képek

Ezen a gépen nincs képszerkesztő és nincs rasterizáló program (se ImageMagick, se Inkscape,
se Node, se Python), ezért a **böngésző rajzol**:

1. Az oldal betölti a Playfair Displayt, és `document.fonts.load()`-dal megvárja.
2. Egy canvasra rákerül a háttér, majd az SVG `Image`-ként, végül a név `fillText`-tel —
   a canvas a betöltött webfontot használja, a magyar ékezetekkel együtt.
3. `canvas.toBlob()` → a letöltés gomb ezt adja át a böngészőnek.

Az SVG-t az oldal `fetch`-csel olvassa be, és **data URI-ként** rajzolja, hogy a vászon ne
„szennyeződjön be" — enélkül a `toBlob()` biztonsági okból megtagadná a kimentést.

Ebből következik egy korlát: **az ikontár webcímről működik.** Ha a fájlt duplakattal, a
lemezről nyitod meg, a böngésző nem engedi beolvasni az SVG-ket, és az oldal ezt ki is írja.

---

## 7. Új ikon felvétele

1. **Rajzold meg** az ikont `assets/ikonok/<nev>.svg` néven, a 4. és 5. pont szabályai szerint.
   A legegyszerűbb a `ber-kalkulator.svg`-t másolni és átszabni — a rács már benne van.
2. **Vedd fel** egy sorral az `ikonok/index.html` tetején lévő `IKONOK` tömbbe:

   ```js
   var IKONOK = [
     { fajl: 'ber-kalkulator.svg', nev: 'Bérkalkulátor', kimenet: 'ber-kalkulator-1920x667.png' },
     { fajl: 'afa-kalkulator.svg', nev: 'Áfakalkulátor', kimenet: 'afa-kalkulator-1920x667.png' }
   ];
   ```

   A négyzetes változatok fájlneve automatikus, az SVG nevéből képződik.
3. **Nézd meg** az ikontárban — külön figyelve a kártyaméretű előnézetre.
4. **Töltsd le** mind a három PNG-t, és tedd be őket az `assets/ikonok/` mappába is.
5. **Commitold és pushold**; a Pages magától frissül.

---

## 8. Felhasználás a honlapon

A bejegyzés szerkesztőjében: **Kiemelt kép → Kiemelt kép beállítása → Feltöltés**, és válaszd
az `<nev>-1920x667.png`-t. A médiatárba feltöltött képet a Smush automatikusan optimalizálja,
ezzel nincs teendő.

Az önálló, 512-es ikon bárhová jó: bejegyzésbe illesztve, listaelem mellé, vagy akár
webhelyikonnak. A **világoskék hátterű** változatot használd, ha nem tudod, milyen alapra
kerül; az **átlátszó** csak világos háttéren helyes.

---

## 9. Buktatók

- **Az átlátszó változat világos alapra való.** A kijelzőből kimaszkolt „Ft" és a billentyűk
  belseje tényleg átlátszó, nem fehér. Sötét háttéren a „Ft" beleolvadna a kijelzőbe.
- **A régi és az új háttérszín nem azonos.** A korábban feltöltött üres kiemelt kép `#EAEFFB`,
  az ikonos bannerek `#F0F0FF`. Egymás mellett minimális, de látható különbség; érdemes a
  régieket lecserélni, ahogy készülnek az ikonok.
- **Az ikontár nem publikus oldal.** Nincs róla link a kalkulátorok nyitóoldaláról, de a
  címét bárki elérheti, aki ismeri. Nincs benne érzékeny adat, csak ne linkeld a honlapról.

---

## 10. Amit még érdemes lehet

- Ikon a további kalkulátorokhoz, ahogy elkészülnek.
- Ha valaha kell **favicon** vagy webhelyikon: az SVG-ből bármilyen méret kirajzolható,
  csak egy újabb méret kell a generátorba.
- Ha az ikonok száma nagyra nő, az `IKONOK` tömb kikerülhet külön JSON-fájlba — egyelőre
  fölösleges bonyolítás lenne.
