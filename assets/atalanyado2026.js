/*
 * Átalányadózó egyéni vállalkozó adó- és járulékszámítása a 2026-os magyar szabályok szerint.
 *
 * Mellékhatás nélküli motor: a `szamol()` bemenetből eredményt ad, DOM-ot nem ismer.
 * Így ugyanez a fájl futtatható a `teszt-atalanyado.html`-ből is.
 *
 * Az adóalap-kedvezmények keretei és a családi kedvezmény sávjai közösek a bérkalkulátoréval,
 * ezért az `szja2026.js`-ből jönnek — ezt a fájlt előbb kell betölteni.
 */
var ATALANY2026 = (function (SZJA) {
  'use strict';

  if (!SZJA) throw new Error('Az atalanyado2026.js betöltése előtt be kell tölteni az szja2026.js-t.');

  var KULCS = SZJA.KULCS;                       // szja 15%, tb-járulék 18,5%, szocho 13%
  var MINIMALBER = SZJA.MINIMALBER;             // 322 800

  var GARANTALT_BERMINIMUM = 373200;

  // Az Szja tv. szerinti költséghányadok: általános, a felsorolt tevékenységeké, kiskereskedelemé.
  var KOLTSEGHANYADOK = [45, 80, 90];

  // Az átalányban megállapított jövedelem adómentes része: az éves minimálbér fele.
  // Nem havi keret: az év elejétől göngyölítve fogy.
  var MENTES_KERET = MINIMALBER * 6;            // 1 936 800

  // Az átalányadózás bevételi értékhatára az éves minimálbér tízszerese; kizárólag
  // kiskereskedelmi tevékenységet végzőnél az ötvenszerese.
  var ERTEKHATAR = MINIMALBER * 12 * 10;        // 38 736 000
  var ERTEKHATAR_KISKER = MINIMALBER * 12 * 50; // 193 680 000

  // A megváltozott munkaképességű vállalkozó szocho-kedvezményének alapja.
  var SZOCHO_KEDVEZMENY_ALAPJA = MINIMALBER * 2;

  var HONAPOK = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június',
                 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

  var JELLEGEK = {
    foallasu: 'Főállású',
    mellett: 'Főállás melletti',
    nyugdijas: 'Nyugdíjas'
  };

  function szam(ertek) {
    var n = typeof ertek === 'number' ? ertek : parseFloat(String(ertek).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  function egesz(ertek) {
    return Math.max(0, Math.round(szam(ertek)));
  }

  /* A 12 havi bevétel: hiányzó hónap 0. Egyetlen szám esetén minden hónapra ugyanaz. */
  function haviBevetelek(bevetelek) {
    var lista = [];
    var i;
    if (typeof bevetelek === 'number' || typeof bevetelek === 'string') {
      for (i = 0; i < 12; i++) lista.push(egesz(bevetelek));
      return lista;
    }
    bevetelek = bevetelek || [];
    for (i = 0; i < 12; i++) lista.push(egesz(bevetelek[i]));
    return lista;
  }

  function ervenyesHanyad(hanyad) {
    var n = Math.round(szam(hanyad));
    return KOLTSEGHANYADOK.indexOf(n) === -1 ? KOLTSEGHANYADOK[0] : n;
  }

  /* A járulékok havi minimumalapja. Csak a főállású vállalkozónál van ilyen: a főállás melletti
     és a nyugdíjas a tényleges jövedelem után fizet (a nyugdíjas szocho- és tb-mentes). */
  function minimumJarulekalap(jelleg, valasztott) {
    if (jelleg !== 'foallasu') return 0;
    return valasztott === 'minimalber' ? MINIMALBER : GARANTALT_BERMINIMUM;
  }

  /**
   * Egy hónap adóalap-kedvezményei. A sorrend kötött: amit egy korábbi kedvezmény már
   * elvitt, azt a későbbi nem tudja még egyszer levonni.
   *
   * A családi kedvezmény külön kezelendő: amit az adóalap nem nyel el, az nem vész el,
   * mert 15%-a családi járulékkedvezményként a járulékból vonható le.
   */
  function honapKedvezmenyei(adoalap, be) {
    var alap = adoalap;
    var tetelek = [];

    function levon(nev, keret) {
      if (keret <= 0) return 0;
      var ervenyesitett = Math.min(alap, keret);
      alap -= ervenyesitett;
      tetelek.push({ nev: nev, jar: keret, ervenyesitett: ervenyesitett, elveszett: keret - ervenyesitett });
      return ervenyesitett;
    }

    var anyak = be.anyakKedvezmenye || 'nincs';
    if (anyak === 'anya30') {
      levon('30 év alatti anyák kedvezménye', SZJA.FIATAL_KERET);
    } else if (anyak === 'netak') {
      levon('Négy vagy több gyermeket nevelő anyák kedvezménye', alap);
    } else if (anyak === 'harom') {
      levon('Három gyermeket nevelő anyák kedvezménye', alap);
    } else if (anyak === 'ketto') {
      levon('Két gyermeket nevelő anyák kedvezménye', alap);
    }

    if (be.fiatal25) levon('25 év alatti fiatalok kedvezménye', SZJA.FIATAL_KERET);
    if (be.szemelyi) levon('Személyi kedvezmény', SZJA.SZEMELYI_KEDVEZMENY);
    if (be.elsoHazas) levon('Első házasok kedvezménye', SZJA.ELSO_HAZASOK_KEDVEZMENYE);

    var igenybeveheto = SZJA.csaladiKedvezmenyOsszege(
      be.kedvezmenyezettEltartott, be.eltartott, be.betegEltartott);
    var ervenyesitett = be.csaladiIgenybevett === null || be.csaladiIgenybevett === undefined
      ? igenybeveheto
      : Math.min(egesz(be.csaladiIgenybevett), igenybeveheto);

    var adoalapbol = Math.min(alap, ervenyesitett);
    var maradek = ervenyesitett - adoalapbol;
    alap -= adoalapbol;

    if (ervenyesitett > 0) {
      tetelek.push({
        nev: 'Családi kedvezmény',
        jar: ervenyesitett,
        ervenyesitett: adoalapbol,
        elveszett: 0,
        jarulekbol: maradek
      });
    }

    return {
      adoelolegAlapja: alap,
      tetelek: tetelek,
      csaladiIgenybeveheto: igenybeveheto,
      csaladiErvenyesitett: ervenyesitett,
      csaladiAdoalapbol: adoalapbol,
      csaladiMaradek: maradek
    };
  }

  /**
   * @param {Object} be
   *   bevetelek                {number[]|number} 12 havi bevétel (vagy egy szám minden hónapra)
   *   koltseghanyad            {number}  45 | 80 | 90
   *   jelleg                   {string}  'foallasu' | 'mellett' | 'nyugdijas'
   *   minimumAlap              {string}  'berminimum' | 'minimalber' (csak főállásúnál számít)
   *   szochoKedvezmeny         {string}  'nincs' | 'megvaltozott'
   *   kiskereskedelem          {boolean} az értékhatár-figyelmeztetéshez
   *   anyakKedvezmenye         {string}  'nincs' | 'netak' | 'harom' | 'ketto' | 'anya30'
   *   fiatal25                 {boolean} 25 év alatti fiatalok kedvezménye
   *   szemelyi                 {boolean} személyi kedvezmény
   *   elsoHazas                {boolean} első házasok kedvezménye
   *   kedvezmenyezettEltartott {number}
   *   eltartott                {number}  összes (figyelembe vehető) eltartott
   *   betegEltartott           {number}  tartósan beteg / súlyosan fogyatékos
   *   csaladiIgenybevett       {number|null} megosztás miatt ténylegesen érvényesített havi összeg;
   *                                          null esetén a teljes igénybe vehető kedvezmény
   */
  function szamol(be) {
    be = be || {};

    var bevetelek = haviBevetelek(be.bevetelek);
    var hanyad = ervenyesHanyad(be.koltseghanyad);
    var jelleg = JELLEGEK[be.jelleg] ? be.jelleg : 'foallasu';
    var minimum = minimumJarulekalap(jelleg, be.minimumAlap);
    var mmk = be.szochoKedvezmeny === 'megvaltozott';

    var kedvezmenyBe = {
      anyakKedvezmenye: be.anyakKedvezmenye || 'nincs',
      fiatal25: !!be.fiatal25,
      szemelyi: !!be.szemelyi,
      elsoHazas: !!be.elsoHazas,
      kedvezmenyezettEltartott: egesz(be.kedvezmenyezettEltartott),
      eltartott: Math.max(egesz(be.eltartott), egesz(be.kedvezmenyezettEltartott)),
      betegEltartott: Math.min(egesz(be.betegEltartott), egesz(be.kedvezmenyezettEltartott)),
      csaladiIgenybevett: be.csaladiIgenybevett === null || be.csaladiIgenybevett === undefined
        ? null : egesz(be.csaladiIgenybevett)
    };

    var honapok = [];
    var i;

    /* ---- 1. kör: bevétel → jövedelem → göngyölt adómentes rész → adóalap ---- */

    var eddigMentes = 0;
    for (i = 0; i < 12; i++) {
      var bevetel = bevetelek[i];
      var koltseg = Math.round(bevetel * hanyad / 100);
      var jovedelem = bevetel - koltseg;
      var mentes = Math.min(jovedelem, MENTES_KERET - eddigMentes);
      eddigMentes += mentes;

      honapok.push({
        honap: HONAPOK[i],
        bevetel: bevetel,
        koltseg: koltseg,
        jovedelem: jovedelem,
        mentes: mentes,
        adoalap: jovedelem - mentes
      });
    }

    /* ---- 2. kör: járulékalapok negyedévente ----
       A járulékalap nem havi, hanem negyedéves szemlélettel áll össze: a negyedév végéig
       göngyölt adóalapból levonjuk azt, amit a korábbi negyedévek már lekötöttek, elosztjuk
       hárommal, és ez lesz mindhárom hónap alapja — de legalább a minimumalap. */

    var eddigAdoalap = 0;
    var eddigSzochoAlap = 0;
    var eddigTbAlap = 0;

    for (i = 0; i < 12; i++) {
      eddigAdoalap += honapok[i].adoalap;

      if ((i + 1) % 3 !== 0) continue;

      var szochoAlap = 0;
      var tbAlap = 0;
      if (jelleg !== 'nyugdijas') {
        szochoAlap = Math.max(Math.round((eddigAdoalap - eddigSzochoAlap) / 3), minimum);
        tbAlap = Math.max(Math.round((eddigAdoalap - eddigTbAlap) / 3), minimum);
      }

      for (var j = i - 2; j <= i; j++) {
        honapok[j].szochoAlap = szochoAlap;
        honapok[j].tbAlap = tbAlap;
      }
      eddigSzochoAlap += szochoAlap * 3;
      eddigTbAlap += tbAlap * 3;
    }

    /* ---- 3. kör: kedvezmények, adó, járulékok havonta ---- */

    var kedvezmenyOsszesito = {};
    var kedvezmenyek = [];

    for (i = 0; i < 12; i++) {
      var ho = honapok[i];
      var k = honapKedvezmenyei(ho.adoalap, kedvezmenyBe);

      ho.adoelolegAlapja = k.adoelolegAlapja;
      ho.csaladiIgenybeveheto = k.csaladiIgenybeveheto;
      ho.csaladiAdoalapbol = k.csaladiAdoalapbol;
      ho.csaladiMaradek = k.csaladiMaradek;

      ho.szja = Math.round(ho.adoelolegAlapja * KULCS.szja);

      ho.szocho = Math.round(ho.szochoAlap * KULCS.szocho);
      ho.szochoKedvezmeny = mmk
        ? Math.round(Math.min(SZOCHO_KEDVEZMENY_ALAPJA, ho.szochoAlap) * KULCS.szocho)
        : 0;
      ho.fizetendoSzocho = ho.szocho - ho.szochoKedvezmeny;

      ho.tbJarulek = Math.round(ho.tbAlap * KULCS.tbJarulek);

      /* A fel nem használt családi kedvezmény 15%-a vonható le a járulékból, legfeljebb
         a járulék összegéig, és legfeljebb a tényleges jövedelem 18,5%-áig. */
      ho.csaladiJarulekkedvezmeny = Math.min(
        Math.trunc(ho.csaladiMaradek * KULCS.szja),
        ho.tbJarulek,
        Math.round(ho.jovedelem * KULCS.tbJarulek));
      ho.fizetendoJarulek = ho.tbJarulek - ho.csaladiJarulekkedvezmeny;

      ho.kozterhek = ho.szja + ho.fizetendoJarulek + ho.fizetendoSzocho;
      ho.marado = ho.bevetel - ho.kozterhek;

      k.tetelek.forEach(function (tetel) {
        if (!kedvezmenyOsszesito[tetel.nev]) {
          kedvezmenyOsszesito[tetel.nev] = { nev: tetel.nev, jar: 0, ervenyesitett: 0, elveszett: 0 };
          kedvezmenyek.push(kedvezmenyOsszesito[tetel.nev]);
        }
        var gyujto = kedvezmenyOsszesito[tetel.nev];
        gyujto.jar += tetel.jar;
        gyujto.ervenyesitett += tetel.ervenyesitett;
        gyujto.elveszett += tetel.elveszett;
      });
    }

    /* ---- Éves összesítés ---- */

    var eves = {
      bevetel: 0, koltseg: 0, jovedelem: 0, mentes: 0, adoalap: 0,
      szochoAlap: 0, tbAlap: 0, adoelolegAlapja: 0,
      szja: 0, szocho: 0, szochoKedvezmeny: 0, fizetendoSzocho: 0,
      tbJarulek: 0, csaladiJarulekkedvezmeny: 0, fizetendoJarulek: 0,
      kozterhek: 0, marado: 0
    };

    honapok.forEach(function (ho) {
      for (var mezo in eves) if (Object.prototype.hasOwnProperty.call(eves, mezo)) eves[mezo] += ho[mezo];
    });

    return {
      koltseghanyad: hanyad,
      jelleg: JELLEGEK[jelleg],
      minimumJarulekalap: minimum,
      honapok: honapok,
      eves: eves,
      kedvezmenyek: kedvezmenyek,
      figyelmeztetesek: figyelmeztetesek(honapok, eves, be, minimum)
    };
  }

  function figyelmeztetesek(honapok, eves, be, minimum) {
    var lista = [];
    var hatar = be.kiskereskedelem ? ERTEKHATAR_KISKER : ERTEKHATAR;

    if (eves.bevetel > hatar) {
      lista.push({
        tipus: 'ertekhatar',
        szoveg: 'Az éves bevétel meghaladja az átalányadózás bevételi értékhatárát (' +
          (be.kiskereskedelem ? 'kiskereskedelmi tevékenységnél az éves minimálbér ötvenszerese' :
           'az éves minimálbér tízszerese') + '), ezért erre az évre az átalányadózás nem választható.'
      });
    }

    var elfogyott = null;
    var gongyolt = 0;
    for (var i = 0; i < 12; i++) {
      gongyolt += honapok[i].mentes;
      if (elfogyott === null && gongyolt >= MENTES_KERET) elfogyott = honapok[i].honap;
    }
    if (elfogyott) {
      lista.push({
        tipus: 'mentes',
        szoveg: 'Az adómentes jövedelemrész (az éves minimálbér fele) ' + elfogyott.toLowerCase() +
          'ban elfogy, onnantól a teljes jövedelem adóköteles.'
      });
    } else if (eves.adoalap === 0 && eves.jovedelem > 0) {
      lista.push({
        tipus: 'mentes',
        szoveg: 'Az éves jövedelem elfér az adómentes keretben, ezért személyi jövedelemadó nem keletkezik. ' +
          'A járulékokat a minimumalap után ilyenkor is meg kell fizetni.'
      });
    }

    var minimumosHonapok = honapok.filter(function (ho) {
      return ho.tbAlap > 0 && ho.tbAlap > ho.jovedelem;
    }).length;
    if (minimum > 0 && minimumosHonapok > 0) {
      lista.push({
        tipus: 'minimum',
        szoveg: minimumosHonapok + ' hónapban a járulékok alapja a minimumszabály miatt magasabb a ' +
          'tényleges jövedelemnél — a járulékot akkor is a minimumalap után kell megfizetni.'
      });
    }

    return lista;
  }

  return {
    KULCS: KULCS,
    MINIMALBER: MINIMALBER,
    GARANTALT_BERMINIMUM: GARANTALT_BERMINIMUM,
    KOLTSEGHANYADOK: KOLTSEGHANYADOK,
    MENTES_KERET: MENTES_KERET,
    ERTEKHATAR: ERTEKHATAR,
    ERTEKHATAR_KISKER: ERTEKHATAR_KISKER,
    SZOCHO_KEDVEZMENY_ALAPJA: SZOCHO_KEDVEZMENY_ALAPJA,
    HONAPOK: HONAPOK,
    JELLEGEK: JELLEGEK,
    minimumJarulekalap: minimumJarulekalap,
    szamol: szamol
  };
})(typeof SZJA2026 !== 'undefined' ? SZJA2026
   : (typeof require !== 'undefined' ? require('./szja2026.js') : null));

if (typeof module !== 'undefined' && module.exports) module.exports = ATALANY2026;
