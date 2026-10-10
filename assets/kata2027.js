/*
 * A kisadózó egyéni vállalkozók tételes adója (új KATA) a 2027-es szabályok szerint.
 *
 * Forrás: „a kisadózó egyéni vállalkozók tételes adójáról szóló törvényjavaslat” társadalmi
 * egyeztetésre bocsátott változata (kormany.hu, 2026. október 6.). Tervezet — az elfogadott
 * törvény eltérhet, ezért minden szám a fájl tetején, paragrafus-hivatkozással lakik.
 *
 * Mellékhatás nélküli motor: a `szamol()` bemenetből eredményt ad, DOM-ot nem ismer.
 * Így ugyanez a fájl futtatható a `teszt-kata.html`-ből is.
 *
 * Éves összegekből számol: a KATA-ban minden teher vagy havi fix összeg, vagy az éves
 * bevételből adódik, a bevétel hónapok közötti eloszlása tehát nem számít.
 */
var KATA2027 = (function () {
  'use strict';

  // 7. § (1) aa) és ba): a havi tételes adó. 2028-tól a minimálbérhez kötődik.
  var TETELES_ADO = { foallasu: 100000, mellek: 50000 };

  // 7. § (4)–(5): a keretösszeg feletti bevételrészre 40% különadó jár. A túllépés nem
  // szerepel az 5. § megszűnési okai között, az adóalanyiság tehát megmarad.
  var KERETOSSZEG = 22000000;
  var KULONADO_KULCS = 0.40;

  // 8. §: a kifizetőtől származó bevétel 15%-a, csökkentve az évben fizetendő tételes adóval.
  var KIEGESZITO_KULCS = 0.15;

  // 10. § (1): a főfoglalkozású kisadózó ellátásainak havi alapja. A nem főfoglalkozású
  // a KATA alapján nem biztosított — 10. § (2).
  var ELLATASI_ALAP = 317000;

  // 10. § (4): jövedelemigazolásban a bevétel 60%-a minősül jövedelemnek.
  var IGAZOLT_JOVEDELEM_HANYAD = 0.60;

  // 5. § (1) g): ha egy kifizetőtől (és kapcsolt vállalkozásaitól) származik a bevétel
  // legalább fele, az adóalanyiság az év utolsó napján megszűnik.
  var MEGRENDELOI_KORLAT = 0.50;

  var JELLEGEK = {
    foallasu: 'Főfoglalkozású',
    mellek: 'Nem főfoglalkozású'
  };

  /* A 8. § (5) szerint a keretösszeg feletti bevételrészre nem jár kiegészítő adó, de a
     tervezet nem mondja meg, hogy vegyes bevételnél a túllépés a céges vagy a magánszemélyektől
     származó részből vonódik-e le. Amíg ez nem tisztázódik, mindhárom olvasat számolható. */
  var ERTELMEZESEK = {
    ovatos: 'Óvatos',
    aranyos: 'Arányos',
    kedvezo: 'Kedvező'
  };

  function szam(ertek) {
    var n = typeof ertek === 'number' ? ertek : parseFloat(String(ertek).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  }

  function egesz(ertek) {
    return Math.max(0, Math.round(szam(ertek)));
  }

  /* 7. § (4): az egész évben tételes adót fizetőnek a teljes keret jár, másnak a tételes
     adóval érintett hónapok tizenkettede. A mentes hónapok tehát a keretet is csökkentik. */
  function keretosszeg(fizetosHonapok) {
    if (fizetosHonapok >= 12) return KERETOSSZEG;
    return Math.round(KERETOSSZEG * fizetosHonapok / 12);
  }

  /* A kiegészítő adó alapja a 8. § (5) egy-egy olvasata szerint.
     - óvatos:  a céges bevétel, legfeljebb a keretig — a legmagasabb adó;
     - arányos: a túllépés a céges és a magánbevétel arányában oszlik meg;
     - kedvező: a túllépés teljes egészében a céges részből jön le, így egyetlen forint sem
                visel egyszerre 15%-ot és 40%-ot.
     Ha csak céges bevétel van, vagy nincs túllépés, a három egybeesik. */
  function kiegeszitoAlapja(ertelmezes, kifizetoi, osszes, keret) {
    var tullepes = Math.max(0, osszes - keret);
    if (ertelmezes === 'kedvezo') return Math.max(0, kifizetoi - tullepes);
    if (ertelmezes === 'aranyos') return osszes > keret ? Math.round(kifizetoi * keret / osszes) : kifizetoi;
    return Math.min(kifizetoi, keret);
  }

  function kiegeszitoAdo(alap, tetelesAdo) {
    return Math.max(0, Math.round(alap * KIEGESZITO_KULCS) - tetelesAdo);
  }

  /**
   * @param {Object} be
   *   jelleg               {string}  'foallasu' | 'mellek'
   *   katasHonapok         {number}  1–12: az adóalanyiság megkezdett hónapjai az évben
   *   mentesHonapok        {number}  ebből azok, amelyekre nem kell tételes adót fizetni
   *                                  (egész hónapos táppénz, CSED, GYED, ápolási díj, szünetelés…)
   *   maganBevetel         {number}  éves bevétel magánszemélyektől
   *   kifizetoiBevetel     {number}  éves bevétel kifizetőtől (cégtől, szervezettől, külföldi kifizetőtől)
   *   legnagyobbMegrendelo {number}  a legnagyobb kifizetőtől és kapcsolt vállalkozásaitól együtt
   *                                  származó éves bevétel; 0, ha nincs megadva
   *   voltMunkaltato       {boolean} számláz-e a munkáltatójának vagy 24 hónapon belül a volt munkáltatójának
   *   koltsegek            {number}  éves költség — az adót nem érinti, csak az adózott jövedelmet
   *   ertelmezes           {string}  'ovatos' | 'aranyos' | 'kedvezo' — a 8. § (5) olvasata
   */
  function szamol(be) {
    be = be || {};

    var jelleg = JELLEGEK[be.jelleg] ? be.jelleg : 'foallasu';
    var ertelmezes = ERTELMEZESEK[be.ertelmezes] ? be.ertelmezes : 'ovatos';

    var katasHonapok = egesz(be.katasHonapok);
    if (katasHonapok < 1 || katasHonapok > 12) katasHonapok = 12;
    var mentesHonapok = Math.min(egesz(be.mentesHonapok), katasHonapok);
    var fizetosHonapok = katasHonapok - mentesHonapok;

    var maganBevetel = egesz(be.maganBevetel);
    var kifizetoiBevetel = egesz(be.kifizetoiBevetel);
    var osszesBevetel = maganBevetel + kifizetoiBevetel;
    var koltsegek = egesz(be.koltsegek);
    var legnagyobbMegrendelo = Math.min(egesz(be.legnagyobbMegrendelo), kifizetoiBevetel);

    /* ---- Tételes adó és keret ---- */

    var haviTetel = TETELES_ADO[jelleg];
    var tetelesAdo = fizetosHonapok * haviTetel;   // 7. § (2): minden megkezdett hónapra teljes összeg
    var keret = keretosszeg(fizetosHonapok);

    /* ---- Különadó: a keret feletti rész 40%-a, a bevétel forrásától függetlenül ---- */

    var tullepes = Math.max(0, osszesBevetel - keret);
    var kulonado = Math.round(tullepes * KULONADO_KULCS);

    /* ---- Kiegészítő adó ----
       8. § (3): a mentes hónapok tételes adója nem számítható be — a `tetelesAdo` eleve csak
       a fizetős hónapokat tartalmazza. */

    var ertelmezesek = {};
    Object.keys(ERTELMEZESEK).forEach(function (kulcs) {
      ertelmezesek[kulcs] = kiegeszitoAdo(
        kiegeszitoAlapja(kulcs, kifizetoiBevetel, osszesBevetel, keret), tetelesAdo);
    });

    var kiegAdo = ertelmezesek[ertelmezes];
    var kozterhek = tetelesAdo + kiegAdo + kulonado;

    var eredmeny = {
      jelleg: JELLEGEK[jelleg],
      ertelmezes: ERTELMEZESEK[ertelmezes],
      katasHonapok: katasHonapok,
      mentesHonapok: mentesHonapok,
      fizetosHonapok: fizetosHonapok,
      haviTetel: haviTetel,

      maganBevetel: maganBevetel,
      kifizetoiBevetel: kifizetoiBevetel,
      osszesBevetel: osszesBevetel,
      koltsegek: koltsegek,

      keret: keret,
      tullepes: tullepes,
      tetelesAdo: tetelesAdo,
      kiegeszitoAlap: kiegeszitoAlapja(ertelmezes, kifizetoiBevetel, osszesBevetel, keret),
      kiegeszitoAdo: kiegAdo,
      kulonado: kulonado,
      kozterhek: kozterhek,
      adozottJovedelem: osszesBevetel - koltsegek - kozterhek,
      hatekonyKulcs: osszesBevetel > 0 ? kozterhek / osszesBevetel : 0,

      // Eddig a céges bevételig a kiegészítő adót teljesen elnyeli a tételes adó.
      kifizetoiKuszob: Math.round(tetelesAdo / KIEGESZITO_KULCS),
      ellatasiAlap: jelleg === 'foallasu' ? ELLATASI_ALAP : 0,
      igazoltJovedelem: Math.round(osszesBevetel * IGAZOLT_JOVEDELEM_HANYAD),
      // A kiegészítő adó és a különadó egyben, a következő év február 25-éig esedékes —
      // havonta ennyit érdemes félretenni rá.
      haviTartalek: Math.ceil((kiegAdo + kulonado) / katasHonapok),

      legnagyobbMegrendelo: legnagyobbMegrendelo,
      megrendeloiArany: osszesBevetel > 0 ? legnagyobbMegrendelo / osszesBevetel : 0,
      ertelmezesek: ertelmezesek
    };

    eredmeny.figyelmeztetesek = figyelmeztetesek(eredmeny, be, jelleg);
    return eredmeny;
  }

  function ftSzoveg(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft';
  }

  /* A szövegek nyilvános felületre kerülnek: csak olyat állítanak, ami a tervezet szövegéből
     következik, a hivatkozott paragrafussal. */
  function figyelmeztetesek(e, be, jelleg) {
    var lista = [];

    if (e.fizetosHonapok === 0 && e.osszesBevetel > 0) {
      lista.push({
        tipus: 'mentes',
        szoveg: 'Egyetlen hónapra sem kell tételes adót fizetni, ezért a tervezet 7. § (4) bekezdése ' +
          'szerint a keretösszeg is nulla, és a teljes bevétel után 40% különadó jár. Szüneteléskor a ' +
          'bevétel megszerzése megszünteti a mentességet — 7. § (8) d).'
      });
    } else if (e.tullepes > 0) {
      lista.push({
        tipus: 'keret',
        szoveg: 'A bevétel <strong>' + ftSzoveg(e.tullepes) + '</strong>-tal meghaladja a keretösszeget' +
          (e.fizetosHonapok < 12 ? ' (' + e.fizetosHonapok + ' fizetős hónap arányos része)' : '') +
          '. Erre a részre 40% különadó jár, az adóalanyiság nem szűnik meg.'
      });
    }

    if (e.megrendeloiArany >= MEGRENDELOI_KORLAT) {
      lista.push({
        tipus: 'megrendelo',
        szoveg: 'A legnagyobb megrendelőtől és kapcsolt vállalkozásaitól származik a bevétel legalább ' +
          'fele, ezért <strong>az adóalanyiság az év utolsó napjával megszűnik</strong> — 5. § (1) g). ' +
          'A megszűnés évére és az azt követő 12 hónapra nem választható újra (6. §).'
      });
    } else if (e.megrendeloiArany >= 0.40) {
      lista.push({
        tipus: 'megrendeloKozel',
        szoveg: 'A legnagyobb megrendelő a bevétel ' + Math.round(e.megrendeloiArany * 100) + '%-át adja. ' +
          'Ha eléri az 50%-ot, az adóalanyiság az év végén megszűnik; a vele kapcsolt vállalkozásoktól ' +
          'kapott bevételt is ide kell számítani — 5. § (1) g).'
      });
    }

    if (be.voltMunkaltato) {
      lista.push({
        tipus: 'munkaltato',
        szoveg: 'Ha a bevétel a munkáltatótól, a munkaviszony megszűnését követő 24 hónapon belül a volt ' +
          'munkáltatótól, vagy ezek jogutódjától, kapcsolt vállalkozásától származik, az adóalanyiság ' +
          '<strong>a bevétel megszerzését megelőző nappal megszűnik</strong> — 5. § (1) f).'
      });
    }

    if (jelleg === 'mellek') {
      lista.push({
        tipus: 'biztositas',
        szoveg: 'A nem főfoglalkozású kisadózó e jogállására tekintettel nem biztosított, ' +
          'társadalombiztosítási ellátásra és álláskeresési ellátásra jogosultságot nem szerez — 10. § (2).'
      });
    }

    var o = e.ertelmezesek;
    if (o.ovatos !== o.kedvezo) {
      lista.push({
        tipus: 'ertelmezes',
        szoveg: 'A kiegészítő adó itt a 8. § (5) értelmezésétől függ: óvatosan ' + ftSzoveg(o.ovatos) +
          ', arányosan ' + ftSzoveg(o.aranyos) + ', kedvezően ' + ftSzoveg(o.kedvezo) +
          '. A tervezet nem rendezi, hogy vegyes bevételnél a keret feletti rész melyik bevételből vonódik le.'
      });
    }

    return lista;
  }

  return {
    TETELES_ADO: TETELES_ADO,
    KERETOSSZEG: KERETOSSZEG,
    KULONADO_KULCS: KULONADO_KULCS,
    KIEGESZITO_KULCS: KIEGESZITO_KULCS,
    ELLATASI_ALAP: ELLATASI_ALAP,
    IGAZOLT_JOVEDELEM_HANYAD: IGAZOLT_JOVEDELEM_HANYAD,
    MEGRENDELOI_KORLAT: MEGRENDELOI_KORLAT,
    JELLEGEK: JELLEGEK,
    ERTELMEZESEK: ERTELMEZESEK,
    keretosszeg: keretosszeg,
    kiegeszitoAlapja: kiegeszitoAlapja,
    szamol: szamol
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = KATA2027;
