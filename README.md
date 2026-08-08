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
| [`assets/szja2026.js`](assets/szja2026.js) | A számítómotor — a felülettől független, tesztelhető |
| [`assets/viktoriawp.css`](assets/viktoriawp.css) | Az arculati CSS, változtatás nélkül |
| [`teszt.html`](teszt.html) | Ellenőrző lap a motorhoz; megnyitáskor lefut |

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

## Beágyazás a honlapba

A kalkulátor `?embed=1` paraméterrel fejléc, hero és lábléc nélkül, átlátszó háttérrel
jelenik meg — így az Elementor HTML-widgetjébe illesztve a honlap saját kerete marad a keret.

```html
<iframe id="ber-kalkulator"
        src="https://ludmilla90ludmilla-ai.github.io/kalkulatorok/ber-kalkulator/?embed=1"
        title="Bér- és jövedelemkalkulátor 2026" loading="lazy"
        style="width:100%;border:0;display:block;" height="1300"></iframe>
<script>
  window.addEventListener('message', function (esemeny) {
    if (esemeny.data && esemeny.data.tipus === 'kalkulator-magassag') {
      document.getElementById('ber-kalkulator').style.height = esemeny.data.magassag + 'px';
    }
  });
</script>
```

A script nem kötelező: nélküle a `height` fix marad, csak az ablak átméretezésekor nem
igazodik. A kalkulátor magától küldi a magasságát minden számítás után.

## Ellenőrzés

Nyisd meg a [`teszt.html`](teszt.html)-t böngészőben. Kézzel kiszámolt eseteket futtat
(minimálbér, 25 év alatti a keret alatt és fölött, egy-, két- és háromgyermekes családi
kedvezmény, a családi járulékkedvezménybe átforduló eset, tartósan beteg eltartott, NÉTAK,
megosztott kedvezmény), plusz 400 véletlen bemeneten ellenőrzi, hogy a nettóból visszaszámolt
bruttó visszavezetve 1 Ft-on belül ugyanazt a nettót adja. A lap tetején látszik, hány
ellenőrzés futott le és hány bukott meg.

## Közzététel

A GitHub Pages a `main` ágat követi a gyökérből, ezért a közzététel egyetlen lépés:

```bash
git push origin main
```
