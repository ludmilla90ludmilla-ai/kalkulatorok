/*
 * Bér- és jövedelemszámítás a 2026-os magyar szabályok szerint.
 *
 * Mellékhatás nélküli motor: a `szamol()` bemenetből eredményt ad, DOM-ot nem ismer.
 * Így ugyanez a fájl futtatható a `teszt.html`-ből is.
 */
var SZJA2026 = (function () {
  'use strict';

  var KULCS = {
    szja: 0.15,
    tbJarulek: 0.185,
    szocho: 0.13
  };

  var MINIMALBER = 322800;

  // A személyi kedvezmény a minimálbér harmada, százra kerekítve.
  var SZEMELYI_KEDVEZMENY = Math.round(MINIMALBER / 300) * 100; // 107 600

  // A 25 év alatti fiatalok és a 30 év alatti anyák kedvezményének közös havi kerete:
  // a megelőző év júliusi bruttó átlagkereset (KSH).
  var FIATAL_KERET = 715765;

  var ELSO_HAZASOK_KEDVEZMENYE = 33335;

  // Családi kedvezmény kedvezményezett eltartottanként, az eltartottak száma szerint.
  var CSALADI_SAVOK = [0, 133340, 266660, 440000];
  var CSALADI_BETEG_TOBBLET = 133340;

  var ANYAK_KEDVEZMENYE = {
    nincs: null,
    netak: 'Négy vagy több gyermeket nevelő anyák kedvezménye',
    harom: 'Három gyermeket nevelő anyák kedvezménye',
    ketto: 'Két gyermeket nevelő anyák kedvezménye',
    anya30: '30 év alatti anyák kedvezménye'
  };

  function szam(ertek) {
    var n = typeof ertek === 'number' ? ertek : parseFloat(String(ertek).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  function egesz(ertek) {
    return Math.max(0, Math.round(szam(ertek)));
  }

  function masol(be) {
    var uj = {};
    for (var kulcs in be) if (Object.prototype.hasOwnProperty.call(be, kulcs)) uj[kulcs] = be[kulcs];
    return uj;
  }

  /* A családi kedvezmény havi összege: a sáv az összes eltartott számától függ,
     de csak a kedvezményezett eltartottak után jár. */
  function csaladiKedvezmenyOsszege(kedvezmenyezett, osszesEltartott, betegEltartott) {
    var db = Math.max(kedvezmenyezett, osszesEltartott);
    var sav = CSALADI_SAVOK[Math.min(db, 3)];
    return sav * kedvezmenyezett + CSALADI_BETEG_TOBBLET * Math.min(betegEltartott, kedvezmenyezett);
  }

  /**
   * @param {Object} be
   *   brutto                   {number} havi bruttó jövedelem összesen
   *   masJovedelem             {number} éves, mástól kapott jövedelem (csak az éves összesítőhöz)
   *   anyakKedvezmenye         {string} 'nincs' | 'netak' | 'harom' | 'ketto' | 'anya30'
   *   fiatal25                 {boolean} 25 év alatti fiatalok kedvezménye
   *   szemelyi                 {boolean} személyi kedvezmény
   *   elsoHazas                {boolean} első házasok kedvezménye
   *   kedvezmenyezettEltartott {number}
   *   eltartott                {number} összes (figyelembe vehető) eltartott
   *   betegEltartott           {number} tartósan beteg / súlyosan fogyatékos
   *   csaladiIgenybevett       {number|null} megosztás miatt ténylegesen érvényesített összeg;
   *                                          null esetén a teljes igénybe vehető kedvezmény
   */
  function szamol(be) {
    be = be || {};

    var brutto = egesz(be.brutto);
    var kedvezmenyezett = egesz(be.kedvezmenyezettEltartott);
    var eltartott = egesz(be.eltartott);
    var beteg = Math.min(egesz(be.betegEltartott), kedvezmenyezett);

    var alap = brutto;
    var tetelek = [];

    // Egy adóalap-kedvezmény érvényesítése. Amit a jövedelem nem nyel el, az elvész.
    function levon(nev, keret) {
      if (keret <= 0) return 0;
      var ervenyesitett = Math.min(alap, keret);
      alap -= ervenyesitett;
      tetelek.push({
        nev: nev,
        jar: keret,
        ervenyesitett: ervenyesitett,
        elveszett: keret - ervenyesitett
      });
      return ervenyesitett;
    }

    // 1. Anyák kedvezményei. A NÉTAK és a két-, illetve háromgyermekes kedvezmény
    //    a teljes munkajövedelmet mentesíti, a 30 év alatti anyáké keretes.
    var anyak = be.anyakKedvezmenye || 'nincs';
    if (anyak === 'anya30') {
      levon(ANYAK_KEDVEZMENYE.anya30, FIATAL_KERET);
    } else if (ANYAK_KEDVEZMENYE[anyak]) {
      levon(ANYAK_KEDVEZMENYE[anyak], alap);
    }

    // 2. 25 év alatti fiatalok kedvezménye
    if (be.fiatal25) levon('25 év alatti fiatalok kedvezménye', FIATAL_KERET);

    // 3. Személyi kedvezmény
    if (be.szemelyi) levon('Személyi kedvezmény', SZEMELYI_KEDVEZMENY);

    // 4. Első házasok kedvezménye
    if (be.elsoHazas) levon('Első házasok kedvezménye', ELSO_HAZASOK_KEDVEZMENYE);

    // 5. Családi kedvezmény. Ami az adóalapból nem fér bele, az nem vész el:
    //    15%-a családi járulékkedvezményként a járulékból vonható le.
    var csaladiIgenybeveheto = csaladiKedvezmenyOsszege(kedvezmenyezett, eltartott, beteg);
    var csaladiErvenyesitett = be.csaladiIgenybevett === null || be.csaladiIgenybevett === undefined
      ? csaladiIgenybeveheto
      : Math.min(egesz(be.csaladiIgenybevett), csaladiIgenybeveheto);

    var csaladiAdoalapbol = Math.min(alap, csaladiErvenyesitett);
    var csaladiMaradek = csaladiErvenyesitett - csaladiAdoalapbol;
    alap -= csaladiAdoalapbol;

    if (csaladiErvenyesitett > 0) {
      tetelek.push({
        nev: 'Családi kedvezmény',
        jar: csaladiErvenyesitett,
        ervenyesitett: csaladiAdoalapbol,
        elveszett: 0,
        jarulekbol: csaladiMaradek
      });
    }

    var adoelolegAlapja = alap;
    var szja = Math.round(adoelolegAlapja * KULCS.szja);
    var tbJarulek = Math.round(brutto * KULCS.tbJarulek);

    // A fel nem használt családi kedvezmény 15%-a, legfeljebb a TB járulék összegéig.
    var csaladiJarulekkedvezmeny = Math.min(Math.round(csaladiMaradek * KULCS.szja), tbJarulek);
    var levontJarulek = tbJarulek - csaladiJarulekkedvezmeny;

    var levonasok = szja + levontJarulek;
    var netto = brutto - levonasok;

    var szocho = Math.round(brutto * KULCS.szocho);
    var berkoltseg = brutto + szocho;

    var masJovedelem = egesz(be.masJovedelem);

    return {
      brutto: brutto,
      adoelolegAlapja: adoelolegAlapja,
      szja: szja,
      tbJarulek: tbJarulek,
      csaladiJarulekkedvezmeny: csaladiJarulekkedvezmeny,
      levontJarulek: levontJarulek,
      levonasok: levonasok,
      netto: netto,
      szocho: szocho,
      berkoltseg: berkoltseg,
      kedvezmenyek: tetelek,
      csaladi: {
        igenybeveheto: csaladiIgenybeveheto,
        ervenyesitett: csaladiErvenyesitett,
        adoalapbol: csaladiAdoalapbol,
        maradek: csaladiMaradek
      },
      eves: {
        adoalap: brutto * 12 + masJovedelem,
        brutto: brutto * 12,
        netto: netto * 12,
        szja: szja * 12,
        jarulek: levontJarulek * 12,
        berkoltseg: berkoltseg * 12
      }
    };
  }

  /* Ugyanaz a bemenet, minden kedvezmény nélkül — a megtakarítás kimutatásához. */
  function kedvezmenyNelkul(be) {
    var masolat = masol(be);
    masolat.anyakKedvezmenye = 'nincs';
    masolat.fiatal25 = false;
    masolat.szemelyi = false;
    masolat.elsoHazas = false;
    masolat.kedvezmenyezettEltartott = 0;
    masolat.eltartott = 0;
    masolat.betegEltartott = 0;
    masolat.csaladiIgenybevett = null;
    return szamol(masolat);
  }

  /**
   * Nettóból bruttó. A nettó szigorúan nő a bruttóval, ezért felező kereséssel
   * megkeressük a legkisebb bruttót, ami legalább a kért nettót adja.
   * Nem külön képlet: ugyanezt a `szamol()`-t hívja, így a két irány nem tud kettéválni.
   */
  function bruttoNettobol(celNetto, be) {
    var cel = egesz(celNetto);

    function bruttoval(brutto) {
      var masolat = masol(be);
      masolat.brutto = brutto;
      return masolat;
    }

    if (cel === 0) return szamol(bruttoval(0));

    function nettoJa(brutto) {
      return szamol(bruttoval(brutto)).netto;
    }

    var also = 0;
    var felso = Math.max(cel * 2, 1000000);
    while (nettoJa(felso) < cel && felso < 1e12) felso *= 2;

    while (also < felso) {
      var kozep = Math.floor((also + felso) / 2);
      if (nettoJa(kozep) < cel) also = kozep + 1;
      else felso = kozep;
    }

    return szamol(bruttoval(also));
  }

  return {
    KULCS: KULCS,
    MINIMALBER: MINIMALBER,
    SZEMELYI_KEDVEZMENY: SZEMELYI_KEDVEZMENY,
    FIATAL_KERET: FIATAL_KERET,
    ELSO_HAZASOK_KEDVEZMENYE: ELSO_HAZASOK_KEDVEZMENYE,
    CSALADI_SAVOK: CSALADI_SAVOK,
    CSALADI_BETEG_TOBBLET: CSALADI_BETEG_TOBBLET,
    csaladiKedvezmenyOsszege: csaladiKedvezmenyOsszege,
    szamol: szamol,
    kedvezmenyNelkul: kedvezmenyNelkul,
    bruttoNettobol: bruttoNettobol
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = SZJA2026;
