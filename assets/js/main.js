/* Ferienwohnung Meerblick · Großenbrode */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------
     Daten: Saisonpreise (Preis pro Nacht, Mindestaufenthalt)
     Endreinigung einmalig 85 €. Herbst-Angebot: 10 % auf Übernachtungen bis 31.12.2026.
     ------------------------------------------------------------------ */
  var SEASONS = [
    ["2026-01-06", "2026-04-03", 85, 3],
    ["2026-04-03", "2026-05-01", 109, 3],
    ["2026-05-01", "2026-05-17", 119, 3],
    ["2026-05-17", "2026-06-01", 129, 3],
    ["2026-06-01", "2026-07-01", 139, 4],
    ["2026-07-01", "2026-09-01", 169, 7],
    ["2026-09-01", "2026-09-13", 139, 4],
    ["2026-09-13", "2026-10-01", 129, 3],
    ["2026-10-01", "2026-11-01", 119, 3],
    ["2026-11-01", "2026-12-24", 85, 3],
    ["2026-12-24", "2026-12-28", 149, 4],
    ["2026-12-28", "2027-01-01", 169, 4],
    ["2027-01-01", "2027-01-06", 149, 3],
    ["2027-01-06", "2027-03-26", 99, 3],
    ["2027-03-26", "2027-05-01", 109, 3],
    ["2027-05-01", "2027-05-16", 119, 3],
    ["2027-05-16", "2027-06-01", 129, 3],
    ["2027-06-01", "2027-07-01", 139, 4],
    ["2027-07-01", "2027-09-01", 169, 7],
    ["2027-09-01", "2027-09-13", 139, 4],
    ["2027-09-13", "2027-10-01", 129, 3],
    ["2027-10-01", "2027-11-01", 119, 3],
    ["2027-11-01", "2027-12-24", 99, 3],
    ["2027-12-24", "2027-12-28", 149, 4],
    ["2027-12-28", "2028-01-01", 169, 4],
    ["2028-01-01", "2028-01-06", 149, 3]
  ];
  var CLEANING = 85;
  var DOG_PER_NIGHT = 8;
  var DEAL_UNTIL = "2027-01-01"; // exklusiv
  var DEAL_RATE = 0.10;
  var HOST_MAIL = "info@meine-ferienwohnung-grossenbrode.de";

  // Präsentationsmodus (lokal oder über den Pitch-Link ?ref=mz): Formulare zeigen nur die Bestätigung.
  // Für alle anderen Besucher öffnet das Absenden eine fertige E-Mail an die Gastgeber.
  var PRESENT = location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  try {
    if (/[?&]ref=mz(&|$)/.test(location.search)) sessionStorage.setItem("mb-ref", "1");
    if (sessionStorage.getItem("mb-ref") === "1") PRESENT = true;
  } catch (e) {
    if (/[?&]ref=mz(&|$)/.test(location.search)) PRESENT = true;
  }
  function openMail(subject, body) {
    var a = document.createElement("a");
    a.href = "mailto:" + HOST_MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Belegte Zeiträume [Anreise, Abreise)
  var BOOKED = [
    ["2026-09-26", "2026-10-03"], ["2026-10-10", "2026-10-17"], ["2026-10-23", "2026-10-30"],
    ["2026-11-06", "2026-11-09"], ["2026-11-20", "2026-11-23"], ["2026-12-04", "2026-12-07"],
    ["2026-12-24", "2026-12-28"], ["2026-12-28", "2027-01-02"],
    ["2027-02-12", "2027-02-16"], ["2027-03-05", "2027-03-08"], ["2027-03-26", "2027-04-02"],
    ["2027-04-09", "2027-04-13"], ["2027-04-30", "2027-05-04"], ["2027-05-05", "2027-05-09"],
    ["2027-05-14", "2027-05-18"], ["2027-05-27", "2027-05-30"], ["2027-06-05", "2027-06-12"],
    ["2027-06-19", "2027-06-26"], ["2027-07-03", "2027-07-10"], ["2027-07-10", "2027-07-17"],
    ["2027-07-17", "2027-07-24"], ["2027-07-31", "2027-08-07"], ["2027-08-07", "2027-08-14"],
    ["2027-08-14", "2027-08-21"], ["2027-08-21", "2027-08-28"], ["2027-09-04", "2027-09-11"],
    ["2027-09-25", "2027-10-02"], ["2027-10-02", "2027-10-09"], ["2027-10-16", "2027-10-23"],
    ["2027-12-24", "2027-12-28"], ["2027-12-28", "2028-01-02"]
  ];

  /* ---------- Datum-Helfer (lokal, ohne Zeitzonen-Fallen) ---------- */
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function addDays(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function diffDays(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5); }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  var MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var DOW_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  function fmtShort(d) { return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear(); }
  function fmtDow(d) { return DOW_SHORT[d.getDay()] + ", " + pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "."; }
  function fmtNoYear(d) { return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "."; }
  function fmtLong(d) { return d.getDate() + ". " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function eur(v, dec) {
    var opts = { style: "currency", currency: "EUR" };
    if (dec === false || Math.abs(v % 1) < 0.001) { opts.minimumFractionDigits = 0; opts.maximumFractionDigits = 0; }
    return new Intl.NumberFormat("de-DE", opts).format(v);
  }

  var bookedNights = {};
  BOOKED.forEach(function (r) {
    for (var d = parse(r[0]), end = parse(r[1]); d < end; d = addDays(d, 1)) bookedNights[key(d)] = true;
  });
  var SEASON_START = parse(SEASONS[0][0]);
  var SEASON_END = parse(SEASONS[SEASONS.length - 1][1]);

  function seasonFor(d) {
    var k = key(d);
    for (var i = 0; i < SEASONS.length; i++) if (k >= SEASONS[i][0] && k < SEASONS[i][1]) return SEASONS[i];
    return null;
  }
  function isBooked(d) { return !!bookedNights[key(d)]; }
  function nightOpen(d) { return d >= today() && !!seasonFor(d) && !isBooked(d); }
  function rangeFree(a, b) { for (var d = a; d < b; d = addDays(d, 1)) if (!nightOpen(d)) return false; return true; }
  function minStay(a) { var s = seasonFor(a); return s ? s[3] : 3; }

  function quote(a, b, opts) {
    opts = opts || {};
    var nights = diffDays(a, b), groups = [], base = 0, discount = 0;
    for (var d = a; d < b; d = addDays(d, 1)) {
      var s = seasonFor(d), p = s ? s[2] : 0;
      base += p;
      if (key(d) < DEAL_UNTIL) discount += p * DEAL_RATE;
      var g = groups[groups.length - 1];
      if (g && g.price === p) g.count++; else groups.push({ price: p, count: 1 });
    }
    discount = Math.round(discount * 100) / 100;
    var dog = opts.dog ? nights * DOG_PER_NIGHT : 0;
    return { nights: nights, groups: groups, base: base, discount: discount, cleaning: CLEANING, dog: dog, total: base - discount + CLEANING + dog };
  }

  /* ------------------------------------------------------------------
     Kalender-Komponente
     ------------------------------------------------------------------ */
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICON_PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
  var ICON_NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';

  function Calendar(el, opts) {
    this.el = el;
    this.opts = opts || {};
    this.months = this.opts.months || 2;
    var t = today();
    this.view = new Date(t.getFullYear(), t.getMonth(), 1);
    this.arrival = this.opts.arrival || null;
    this.departure = this.opts.departure || null;
    if (this.arrival) this.view = new Date(this.arrival.getFullYear(), this.arrival.getMonth(), 1);
    this.hover = null;
    this.message = "";
    var self = this;
    el.classList.add("cal");
    el.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn || !el.contains(btn)) return;
      if (btn.dataset.nav) { self.shift(+btn.dataset.nav); return; }
      if (btn.dataset.date && self.opts.selectable !== false) self.pick(parse(btn.dataset.date));
    });
    el.addEventListener("mouseover", function (e) {
      var btn = e.target.closest("button[data-date]");
      if (!btn || !self.arrival || self.departure) return;
      var d = parse(btn.dataset.date);
      if (!self.hover || key(self.hover) !== key(d)) { self.hover = d; self.paintRange(); }
    });
    el.addEventListener("mouseleave", function () { if (self.hover) { self.hover = null; self.paintRange(); } });
    el.addEventListener("keydown", function (e) {
      var btn = e.target.closest("button[data-date]");
      var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!btn || !(e.key in steps)) return;
      e.preventDefault();
      self.moveFocus(parse(btn.dataset.date), steps[e.key]);
    });
    this.render();
  }
  Calendar.prototype.moveFocus = function (from, step) {
    var d = from;
    for (var i = 0; i < 60; i++) {
      d = addDays(d, step);
      if (d < today() || d > SEASON_END) return;
      var btn = this.el.querySelector('button[data-date="' + key(d) + '"]');
      if (!btn) {
        var first = new Date(this.view.getFullYear(), this.view.getMonth(), 1);
        if (d < first && this.canPrev()) this.shift(-1); else if (d >= first && this.canNext()) this.shift(1); else return;
        btn = this.el.querySelector('button[data-date="' + key(d) + '"]');
      }
      if (btn && !btn.disabled) { this.focusBtn(btn); return; }
    }
  };
  Calendar.prototype.focusBtn = function (btn) {
    this.el.querySelectorAll('button[data-date][tabindex="0"]').forEach(function (b) { b.setAttribute("tabindex", "-1"); });
    btn.setAttribute("tabindex", "0");
    btn.focus();
  };
  Calendar.prototype.setFocusable = function () {
    var q = function (d) { return d ? this.el.querySelector('button[data-date="' + key(d) + '"]:not(:disabled)') : null; }.bind(this);
    var target = q(this.departure) || q(this.arrival) || q(today()) || this.el.querySelector("button[data-date]:not(:disabled)");
    if (target) target.setAttribute("tabindex", "0");
  };
  Calendar.prototype.focus = function () {
    var b = this.el.querySelector('button[data-date][tabindex="0"]');
    if (b) b.focus();
  };
  Calendar.prototype.setMonths = function (n) { if (n !== this.months) { this.months = n; this.render(); } };
  Calendar.prototype.shift = function (n) { this.view = new Date(this.view.getFullYear(), this.view.getMonth() + n, 1); this.render(); };
  Calendar.prototype.canPrev = function () { var t = today(); return this.view > new Date(t.getFullYear(), t.getMonth(), 1); };
  Calendar.prototype.canNext = function () { var last = new Date(this.view.getFullYear(), this.view.getMonth() + this.months, 1); return last <= new Date(SEASON_END.getFullYear(), SEASON_END.getMonth(), 1); };

  Calendar.prototype.pick = function (d) {
    var a = this.arrival, b = this.departure;
    if (!a || b || d <= a) {
      if (!nightOpen(d)) { this.message = isBooked(d) ? "Dieser Tag ist leider schon belegt. Bitte wählen Sie einen anderen Anreisetag." : ""; this.update(); return; }
      this.arrival = d; this.departure = null; this.message = "";
    } else {
      var n = diffDays(a, d), min = minStay(a);
      if (!rangeFree(a, d)) {
        if (nightOpen(d)) { this.arrival = d; this.departure = null; this.message = ""; }
        else { this.message = "Im gewählten Zeitraum ist die Wohnung bereits belegt."; }
      } else if (n < min) {
        this.message = "In dieser Reisezeit beträgt der Mindestaufenthalt " + min + " Nächte.";
      } else {
        this.departure = d; this.message = "";
      }
    }
    this.hover = null;
    this.update();
  };
  Calendar.prototype.set = function (a, b) { this.arrival = a; this.departure = b; if (a) this.view = new Date(a.getFullYear(), a.getMonth(), 1); this.render(); };
  Calendar.prototype.clear = function () { this.arrival = null; this.departure = null; this.message = ""; this.update(); };
  Calendar.prototype.update = function () { this.paintRange(); this.renderHint(); if (this.opts.onChange) this.opts.onChange(this.arrival, this.departure); };

  Calendar.prototype.render = function () {
    var t = today(), html = "";
    html += '<div class="cal__nav"><button type="button" class="cal__navbtn" data-nav="-1" aria-label="Vorheriger Monat"' + (this.canPrev() ? "" : " disabled") + ">" + ICON_PREV + "</button>";
    html += '<span class="visually-hidden" aria-live="polite">' + MONTHS[this.view.getMonth()] + " " + this.view.getFullYear() + "</span>";
    html += '<button type="button" class="cal__navbtn" data-nav="1" aria-label="Nächster Monat"' + (this.canNext() ? "" : " disabled") + ">" + ICON_NEXT + "</button></div>";
    html += '<div class="cal__months" style="--months:' + this.months + '">';
    for (var m = 0; m < this.months; m++) {
      var first = new Date(this.view.getFullYear(), this.view.getMonth() + m, 1);
      var days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      var offset = (first.getDay() + 6) % 7;
      html += '<div class="cal__month"><div class="cal__title">' + MONTHS[first.getMonth()] + " " + first.getFullYear() + '</div><div class="cal__grid">';
      ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].forEach(function (w) { html += '<div class="cal__dow" aria-hidden="true">' + w + "</div>"; });
      for (var i = 0; i < offset; i++) html += '<button type="button" class="cal__day is-blank" tabindex="-1" aria-hidden="true"></button>';
      for (var dnum = 1; dnum <= days; dnum++) {
        var d = new Date(first.getFullYear(), first.getMonth(), dnum);
        var prev = addDays(d, -1), cls = ["cal__day"], label = fmtLong(d), disabled = false;
        var bNight = isBooked(d), bPrev = isBooked(prev);
        if (d < t) { cls.push("is-past"); disabled = true; }
        else if (d < SEASON_START || d > SEASON_END) { cls.push("is-closed"); disabled = true; }
        else if (bNight && bPrev) {
          cls.push("is-booked"); label += ", belegt";
          if (!isBooked(addDays(d, 1))) cls.push("is-edge-end");
        } else if (bNight && !bPrev) { cls.push("is-out"); label += ", nur Abreise möglich"; }
        else if (!bNight && bPrev) { cls.push("is-in"); label += ", Anreise möglich"; }
        else { cls.push("is-free"); label += ", frei"; }
        if (key(d) === key(t)) cls.push("is-today");
        html += '<button type="button" class="' + cls.join(" ") + '" data-date="' + key(d) + '" tabindex="-1" aria-label="' + label + '"' + (disabled ? " disabled" : "") + "><span>" + dnum + "</span></button>";
      }
      html += "</div></div>";
    }
    html += "</div>";
    if (this.opts.legend !== false) {
      html += '<div class="cal__legend"><span><i class="lg-free"></i>frei</span><span><i class="lg-booked"></i>belegt</span><span><i class="lg-half"></i>Wechseltag (An- bzw. Abreise möglich)</span>' + (this.opts.selectable !== false ? '<span><i class="lg-sel"></i>Ihr Zeitraum</span>' : "") + "</div>";
    }
    if (this.opts.selectable !== false) html += '<p class="cal__hint" aria-live="polite"></p>';
    this.el.innerHTML = html;
    this.setFocusable();
    this.paintRange();
    this.renderHint();
  };

  Calendar.prototype.paintRange = function () {
    var a = this.arrival, b = this.departure || (this.hover && a && this.hover > a ? this.hover : null);
    var preview = !this.departure && !!b;
    var min = a ? minStay(a) : 0;
    var free = a && b ? rangeFree(a, b) : false;
    this.el.querySelectorAll("button[data-date]").forEach(function (btn) {
      var d = parse(btn.dataset.date);
      btn.classList.remove("is-start", "is-end", "is-range", "has-range", "is-tooshort");
      if (a && key(d) === key(a)) { btn.classList.add("is-start"); if (b) btn.classList.add("has-range"); }
      if (a && b && (!preview || free)) {
        if (key(d) === key(b) && !preview) btn.classList.add("is-end", "has-range");
        else if (d > a && d <= b) btn.classList.add("is-range");
      }
      if (a && !this.departure && d > a && diffDays(a, d) < min && !btn.disabled) btn.classList.add("is-tooshort");
      btn.setAttribute("aria-pressed", (a && key(d) === key(a)) || (this.departure && key(d) === key(this.departure)) ? "true" : "false");
    }, this);
  };

  Calendar.prototype.renderHint = function () {
    var h = this.el.querySelector(".cal__hint");
    if (!h) return;
    h.classList.toggle("is-warn", !!this.message);
    if (this.message) { h.textContent = this.message; return; }
    if (!this.arrival) { h.innerHTML = "Wählen Sie Ihren <b>Anreisetag</b>."; return; }
    if (!this.departure) { h.innerHTML = "Anreise " + fmtDow(this.arrival) + " · Jetzt den <b>Abreisetag</b> wählen (mindestens " + minStay(this.arrival) + " Nächte)."; return; }
    var n = diffDays(this.arrival, this.departure);
    h.innerHTML = "<b>" + fmtDow(this.arrival) + " – " + fmtDow(this.departure) + this.departure.getFullYear() + "</b> · " + n + " Nächte · Zeitraum ist frei.";
  };

  function monthsForWidth(el) { return el.getBoundingClientRect().width < 560 ? 1 : 2; }

  /* ------------------------------------------------------------------
     Header, Navigation
     ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");
  var mobileCta = document.querySelector(".mobile-cta");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (mobileCta) { var vis = y > 560; mobileCta.classList.toggle("is-visible", vis); mobileCta.inert = !vis; }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".nav-toggle");
  var mnav = document.getElementById("mobile-nav");
  if (toggle && mnav) {
    var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var placeMenu = function () { mnav.style.setProperty("--menu-top", Math.max(0, header.getBoundingClientRect().bottom) + "px"); };
    var setNav = function (open) {
      if (open) placeMenu();
      mnav.classList.toggle("is-open", open);
      header.classList.toggle("nav-is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      toggle.innerHTML = open ? ICON_CLOSE : ICON_MENU;
    };
    toggle.addEventListener("click", function () { setNav(!mnav.classList.contains("is-open")); });
    mnav.addEventListener("click", function (e) { if (e.target.closest("a")) setNav(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mnav.classList.contains("is-open")) { setNav(false); toggle.focus(); } });
    window.addEventListener("resize", function () {
      if (!mnav.classList.contains("is-open")) return;
      if (window.innerWidth > 1080) setNav(false); else placeMenu();
    });
  }

  /* ------------------------------------------------------------------
     Sonnenuntergang Großenbrode (NOAA-Näherung)
     ------------------------------------------------------------------ */
  function sunsetUTC(date, lat, lon) {
    var rad = Math.PI / 180;
    var N = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 864e5);
    var lngHour = lon / 15, t = N + ((18 - lngHour) / 24);
    var M = (0.9856 * t) - 3.289;
    var L = M + (1.916 * Math.sin(M * rad)) + (0.020 * Math.sin(2 * M * rad)) + 282.634;
    L = (L + 360) % 360;
    var RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = (RA + 360) % 360;
    RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
    var sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
    var cosH = (Math.cos(90.833 * rad) - (sinDec * Math.sin(lat * rad))) / (cosDec * Math.cos(lat * rad));
    if (cosH < -1 || cosH > 1) return null;
    var H = Math.acos(cosH) / rad / 15;
    var T = H + RA - (0.06571 * t) - 6.622;
    var UT = (T - lngHour + 48) % 24;
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0) + UT * 3600e3);
  }
  document.querySelectorAll("[data-sunset]").forEach(function (el) {
    var s = sunsetUTC(new Date(), 54.3603, 11.0924);
    if (!s) return;
    el.textContent = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(s);
  });

  /* Stand der Belegung, Jahr, Zeitraum-Texte */
  document.querySelectorAll("[data-today]").forEach(function (el) { el.textContent = fmtShort(today()); });
  document.querySelectorAll("[data-current-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Ab-Preis aus den kommenden Saisons, Angebot nach Ablauf ausblenden */
  var fromPrice = Infinity;
  SEASONS.forEach(function (s) { if (parse(s[1]) > today()) fromPrice = Math.min(fromPrice, s[2]); });
  if (fromPrice < Infinity) document.querySelectorAll("[data-from-price]").forEach(function (el) { el.textContent = fromPrice; });
  var dealActive = key(today()) < DEAL_UNTIL;
  if (!dealActive) document.querySelectorAll("[data-deal]").forEach(function (el) { el.hidden = true; });

  /* Freie Sommerwochen (Samstag bis Samstag, Juli und August) */
  (function () {
    var t = today(), y = t.getMonth() > 7 ? t.getFullYear() + 1 : t.getFullYear();
    var d = new Date(y, 6, 1);
    while (d.getDay() !== 6) d = addDays(d, 1);
    var free = 0, total = 0;
    for (; d < new Date(y, 8, 1); d = addDays(d, 7)) {
      if (!seasonFor(d)) continue;
      total++;
      if (rangeFree(d, addDays(d, 7))) free++;
    }
    if (!total) return;
    document.querySelectorAll("[data-summer-free]").forEach(function (el) {
      el.innerHTML = "<span>" + (free === 0 ? "Sommer " + y + ": Juli und August sind ausgebucht."
        : "Sommer " + y + ": noch <b>" + free + " von " + total + " Wochen</b> im Juli und August frei (Samstag bis Samstag).") + "</span>";
      el.hidden = false;
    });
  })();

  /* ------------------------------------------------------------------
     Reveal
     ------------------------------------------------------------------ */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add("is-in"); });

  /* ------------------------------------------------------------------
     Belegungskalender (nur Anzeige / Auswahl → Buchung)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-calendar]").forEach(function (el) {
    var cta = document.querySelector(el.dataset.calendar);
    var cal = new Calendar(el, {
      months: monthsForWidth(el),
      onChange: function (a, b) {
        if (!cta) return;
        if (a && b) {
          var q = quote(a, b);
          cta.href = "buchen.html?an=" + key(a) + "&ab=" + key(b);
          cta.innerHTML = "Für " + q.nights + " Nächte anfragen · " + eur(q.total, true) + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        } else {
          cta.href = "buchen.html";
          cta.innerHTML = cta.dataset.label + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
        }
      }
    });
    if (cta) cta.dataset.label = cta.textContent.trim();
    window.addEventListener("resize", function () { cal.setMonths(monthsForWidth(el)); });
  });

  /* ------------------------------------------------------------------
     Buchungsleiste (Startseite)
     ------------------------------------------------------------------ */
  var bookbar = document.querySelector("[data-bookbar]");
  if (bookbar) {
    var pop = bookbar.querySelector(".popover");
    var calEl = pop.querySelector("[data-popcal]");
    var vDates = bookbar.querySelector("[data-v-dates]");
    var guests = bookbar.querySelector("select");
    var go = bookbar.querySelector("[data-go]");
    var priceEl = pop.querySelector("[data-pop-price]");
    var doneBtn = pop.querySelector("[data-pop-done]");
    var range = { a: null, b: null };
    var pcal = null;

    function updateBar() {
      if (range.a && range.b) {
        var narrow = window.innerWidth < 600;
        vDates.textContent = narrow ? fmtNoYear(range.a) + " – " + fmtNoYear(range.b) : fmtDow(range.a) + " – " + fmtDow(range.b);
        vDates.classList.remove("is-placeholder");
        var q = quote(range.a, range.b);
        priceEl.innerHTML = q.nights + " Nächte · <b>" + eur(q.total) + "</b> inkl. Endreinigung" + (q.discount > 0 ? '<span class="popover__save">davon ' + eur(q.discount) + " Herbst-Rabatt abgezogen</span>" : "");
        doneBtn.disabled = false;
        go.innerHTML = "Anfragen · " + eur(q.total) + " " + ARROW;
      } else {
        vDates.textContent = range.a ? fmtNoYear(range.a) + " – Abreise?" : "Daten wählen";
        vDates.classList.toggle("is-placeholder", !range.a);
        priceEl.textContent = range.a ? "Mindestens " + minStay(range.a) + " Nächte in dieser Reisezeit." : "Mindestaufenthalt je nach Reisezeit 3 bis 7 Nächte.";
        doneBtn.disabled = true;
        go.innerHTML = goLabel;
      }
    }
    var goLabel = go.innerHTML;
    function goToBooking() {
      var url = "buchen.html?g=" + guests.value;
      if (range.a && range.b) url += "&an=" + key(range.a) + "&ab=" + key(range.b);
      window.location.href = url;
    }
    function openPop() {
      if (!pcal) pcal = new Calendar(calEl, { months: window.innerWidth < 860 ? 1 : 2, onChange: function (a, b) { range.a = a; range.b = b; updateBar(); } });
      pop.classList.add("is-open");
      bookbar.querySelector("[data-open-dates]").setAttribute("aria-expanded", "true");
      var r = pop.getBoundingClientRect();
      if (r.bottom > window.innerHeight && window.innerWidth > 860) window.scrollBy({ top: r.bottom - window.innerHeight + 24, behavior: "smooth" });
      setTimeout(function () { pcal.focus(); }, 60);
    }
    function closePop() { pop.classList.remove("is-open"); bookbar.querySelector("[data-open-dates]").setAttribute("aria-expanded", "false"); }
    bookbar.querySelector("[data-open-dates]").addEventListener("click", function (e) { e.stopPropagation(); pop.classList.contains("is-open") ? closePop() : openPop(); });
    doneBtn.addEventListener("click", goToBooking);
    pop.querySelector("[data-pop-close]").addEventListener("click", closePop);
    document.addEventListener("click", function (e) { if (e.target.isConnected && !bookbar.contains(e.target)) closePop(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePop(); });
    go.addEventListener("click", function (e) {
      e.preventDefault();
      if (range.a && range.b) { goToBooking(); return; }
      e.stopPropagation();
      openPop();
    });
    updateBar();
  }

  /* ------------------------------------------------------------------
     Preistabellen
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-price-table]").forEach(function (wrap) {
    var tabs = wrap.querySelectorAll("[role=tab]");
    var body = wrap.querySelector("tbody");
    function render(year) {
      var t = today(), rows = "";
      SEASONS.forEach(function (s) {
        var a = parse(s[0]), b = parse(s[1]);
        if (a.getFullYear() !== year || b <= t) return;
        var now = t >= a && t < b;
        var deal = s[0] < DEAL_UNTIL && b > t;
        var priceCell = deal ? "<s>" + eur(s[2]) + "</s>" + eur(s[2] * (1 - DEAL_RATE), true) : eur(s[2]);
        rows += "<tr" + (now ? ' class="is-now"' : b <= t ? ' class="is-past"' : "") + '><td><span class="season"><span>' + fmtNoYear(a) + " – " + fmtNoYear(addDays(b, -1)) + (now ? '<span class="tag-now">Aktuell</span>' : "") + "</span><small>" + seasonName(a) + "</small></span></td><td>" + priceCell + "</td><td>" + s[3] + " Nächte</td></tr>";
      });
      body.innerHTML = rows || '<tr><td colspan="3">Für dieses Jahr sind alle Zeiträume vorbei.</td></tr>';
      tabs.forEach(function (tb) { tb.setAttribute("aria-selected", +tb.dataset.year === year ? "true" : "false"); });
    }
    function seasonName(a) {
      var m = a.getMonth() + 1, d = a.getDate();
      if (m === 12 && d >= 24 && d < 28) return "Weihnachten";
      if ((m === 12 && d >= 28) || (m === 1 && d < 6)) return "Silvester und Neujahr";
      if (m === 7 || m === 8) return "Hauptsaison";
      if (m === 6 || (m === 9 && d < 13)) return "Sommer";
      if (m === 11 || m === 1 || m === 2 || (m === 3 && d < 26)) return "Nebensaison";
      return "Zwischensaison";
    }
    tabs.forEach(function (tb) { tb.addEventListener("click", function () { render(+tb.dataset.year); }); });
    render(Math.max(2026, Math.min(2027, today().getFullYear())));
  });

  /* ------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------ */
  var groups = {};
  document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
    var g = btn.dataset.lightbox;
    (groups[g] = groups[g] || []).push(btn);
  });
  if (Object.keys(groups).length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Bildergalerie");
    lb.innerHTML = '<div class="lightbox__bar"><span class="lightbox__count"></span><button type="button" class="lightbox__btn" data-lb-close aria-label="Schließen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="lightbox__stage"><img alt=""></div><p class="lightbox__caption"></p><button type="button" class="lightbox__btn lightbox__prev" data-lb-prev aria-label="Vorheriges Bild">' + ICON_PREV + '</button><button type="button" class="lightbox__btn lightbox__next" data-lb-next aria-label="Nächstes Bild">' + ICON_NEXT + "</button>";
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lightbox__caption"), lbCount = lb.querySelector(".lightbox__count");
    var cur = { g: null, i: 0 }, lastFocus = null;
    function show() {
      var list = groups[cur.g], btn = list[cur.i];
      lbImg.src = btn.dataset.full;
      lbImg.alt = btn.querySelector("img").alt;
      lbCap.textContent = btn.querySelector("img").alt;
      lbCount.textContent = (cur.i + 1) + " / " + list.length;
    }
    function open(g, i) { cur.g = g; cur.i = i; lastFocus = document.activeElement; show(); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; lb.querySelector("[data-lb-close]").focus(); }
    function close() { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
    function step(n) { var l = groups[cur.g].length; cur.i = (cur.i + n + l) % l; show(); }
    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (btn, i) { btn.addEventListener("click", function () { open(g, btn.dataset.start ? +btn.dataset.start : i); }); });
    });
    lb.querySelector("[data-lb-close]").addEventListener("click", close);
    lb.querySelector("[data-lb-prev]").addEventListener("click", function () { step(-1); });
    lb.querySelector("[data-lb-next]").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lightbox__stage")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });
  }

  /* ------------------------------------------------------------------
     Karte (2-Klick-Lösung)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-map-load]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var map = btn.closest(".map");
      var f = document.createElement("iframe");
      f.title = "Karte: Südstrand 54, 23775 Großenbrode";
      f.loading = "lazy";
      f.src = "https://www.openstreetmap.org/export/embed.html?bbox=11.0800%2C54.3545%2C11.1050%2C54.3660&layer=mapnik&marker=54.36032%2C11.09243";
      map.innerHTML = "";
      map.appendChild(f);
    });
  });

  /* ------------------------------------------------------------------
     Formular-Helfer
     ------------------------------------------------------------------ */
  function fieldValid(inp) {
    var v = inp.value.trim();
    if (inp.type === "checkbox") return inp.checked;
    if (inp.required && !v) return false;
    if (inp.type === "email" && v) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return true;
  }
  function markField(inp, ok) {
    var wrap = inp.closest(".field") || inp.closest(".check");
    if (wrap) wrap.classList.toggle("has-error", !ok);
    inp.setAttribute("aria-invalid", ok ? "false" : "true");
  }
  function prepareForm(form) {
    form.querySelectorAll("[required]").forEach(function (inp, i) {
      var err = inp.closest(".field") && inp.closest(".field").querySelector(".field__error");
      if (err) { err.id = err.id || (form.id || "f") + "-err-" + i; inp.setAttribute("aria-describedby", err.id); }
    });
    form.addEventListener("input", function (e) {
      var inp = e.target;
      if (inp.getAttribute("aria-invalid") === "true" && fieldValid(inp)) markField(inp, true);
    });
    form.addEventListener("focusout", function (e) {
      var inp = e.target;
      if (inp.matches && inp.matches("[required]") && inp.value.trim()) markField(inp, fieldValid(inp));
    });
  }
  function validate(form) {
    var first = null;
    form.querySelectorAll("[required]").forEach(function (inp) {
      var ok = fieldValid(inp);
      markField(inp, ok);
      if (!ok && !first) first = inp;
    });
    if (first) first.focus();
    return !first;
  }
  function refNo() { var d = new Date(); return "MB-" + d.getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)); }

  /* Kontaktformular */
  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    prepareForm(contactForm);
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(contactForm)) return;
      var ok = document.querySelector("[data-contact-success]");
      var cv = function (n) { var el = contactForm.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; };
      ok.querySelector("[data-name]").textContent = cv("vorname");
      if (!PRESENT) {
        openMail("Frage zur Ferienwohnung Meerblick",
          "Hallo Petra und Mirko,\n\n" + cv("nachricht") + "\n\nViele Grüße\n" + cv("vorname") + " " + cv("nachname") +
          "\nE-Mail: " + cv("email") + (cv("telefon") ? "\nTelefon: " + cv("telefon") : ""));
        ok.querySelector("p").textContent = "Ihr E-Mail-Programm hat Ihre Nachricht an uns geöffnet. Bitte senden Sie die E-Mail ab, dann antworten wir Ihnen.";
      }
      contactForm.hidden = true;
      ok.classList.add("is-visible");
      ok.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ------------------------------------------------------------------
     Buchungsseite
     ------------------------------------------------------------------ */
  var booking = document.querySelector("[data-booking]");
  if (booking) {
    var params = new URLSearchParams(location.search);
    var state = { a: null, b: null, adults: 2, kids: 0, dog: false, linen: false };
    var pa = params.get("an"), pb = params.get("ab"), pg = params.get("g");
    if (pg && +pg >= 1 && +pg <= 4) state.adults = Math.min(+pg, 4);
    if (pa && pb && /^\d{4}-\d{2}-\d{2}$/.test(pa) && /^\d{4}-\d{2}-\d{2}$/.test(pb)) {
      var A = parse(pa), B = parse(pb);
      if (B > A && rangeFree(A, B) && diffDays(A, B) >= minStay(A)) { state.a = A; state.b = B; }
    }
    var calB = booking.querySelector("[data-booking-cal]");
    var bcal = new Calendar(calB, {
      months: monthsForWidth(calB), arrival: state.a, departure: state.b,
      onChange: function (a, b) { state.a = a; state.b = b; renderSummary(); }
    });
    window.addEventListener("resize", function () { bcal.setMonths(monthsForWidth(calB)); });

    // Gäste-Stepper
    booking.querySelectorAll("[data-stepper]").forEach(function (st) {
      var k = st.dataset.stepper, out = st.querySelector("output"), minus = st.querySelector("[data-minus]"), plus = st.querySelector("[data-plus]");
      function paint() {
        out.textContent = state[k];
        var total = state.adults + state.kids;
        minus.disabled = k === "adults" ? state.adults <= 1 : state.kids <= 0;
        booking.querySelectorAll("[data-plus]").forEach(function (p) { p.disabled = total >= 4; });
      }
      minus.addEventListener("click", function () { state[k]--; paint(); refreshSteppers(); renderSummary(); });
      plus.addEventListener("click", function () { if (state.adults + state.kids < 4) { state[k]++; } paint(); refreshSteppers(); renderSummary(); });
      st._paint = paint;
    });
    function refreshSteppers() { booking.querySelectorAll("[data-stepper]").forEach(function (st) { st._paint(); }); }
    refreshSteppers();
    var dogInp = booking.querySelector("[data-dog]");
    dogInp.addEventListener("change", function () { state.dog = dogInp.checked; renderSummary(); });
    var linenInp = booking.querySelector("[data-linen]");
    linenInp.addEventListener("change", function () { state.linen = linenInp.checked; renderSummary(); });

    var sum = document.querySelector("[data-summary]");
    var bar = document.querySelector("[data-booking-bar]");
    var form = booking.querySelector("form");
    prepareForm(form);

    function guestsText() {
      return state.adults + " " + (state.adults === 1 ? "Erwachsener" : "Erwachsene") + (state.kids ? ", " + state.kids + " " + (state.kids === 1 ? "Kind" : "Kinder") : "") + (state.dog ? ", 1 Hund" : "") + (state.linen ? ", Wäschepaket" : "");
    }
    function renderSummary() {
      var dates = sum.querySelector("[data-sum-dates]"), body = sum.querySelector("[data-sum-body]");
      dates.innerHTML = '<div><span>Anreise</span><b>' + (state.a ? fmtDow(state.a) + state.a.getFullYear() : "–") + '</b></div><div><span>Abreise</span><b>' + (state.b ? fmtDow(state.b) + state.b.getFullYear() : "–") + "</b></div>";
      sum.querySelector("[data-sum-guests]").textContent = guestsText();
      var steps = document.querySelectorAll("[data-steps] li");
      if (steps.length) {
        steps[0].className = state.a && state.b ? "is-done" : "is-active";
        steps[1].className = state.a && state.b ? "is-active" : "";
      }
      var cancel = sum.querySelector("[data-trust-cancel] span");
      if (cancel) {
        var dealStay = state.a ? key(state.a) < DEAL_UNTIL : dealActive;
        cancel.textContent = dealStay ? "Kostenlose Stornierung bis 30 Tage vor Anreise (Herbst-Angebot)" : "Stornobedingungen erhalten Sie mit der Bestätigung";
      }
      if (!state.a || !state.b) {
        body.innerHTML = '<p class="summary__empty">Wählen Sie im Kalender Ihren Reisezeitraum. Der Preis wird sofort berechnet.</p>';
        updateBar();
        return;
      }
      var q = quote(state.a, state.b, { dog: state.dog }), lines = "";
      q.groups.forEach(function (gr) { lines += "<li><span>" + gr.count + " " + (gr.count === 1 ? "Nacht" : "Nächte") + " × " + eur(gr.price) + "</span><span>" + eur(gr.count * gr.price) + "</span></li>"; });
      if (q.discount > 0) lines += '<li class="is-discount"><span>Herbst-Angebot −10 %</span><span>− ' + eur(q.discount) + "</span></li>";
      lines += "<li><span>Endreinigung</span><span>" + eur(q.cleaning) + "</span></li>";
      if (q.dog) lines += "<li><span>Hund (" + q.nights + " × " + eur(DOG_PER_NIGHT) + ")</span><span>" + eur(q.dog) + "</span></li>";
      if (state.linen) lines += "<li><span>Wäschepaket</span><span>Preis auf Anfrage</span></li>";
      lines += "<li><span>Tiefgaragenplatz, WLAN, Sauna</span><span>inklusive</span></li>";
      body.innerHTML = '<ul class="lines">' + lines + '</ul><div class="total"><span>Gesamt</span><b>' + eur(q.total) + '</b></div><p class="summary__note">Preise in Euro inkl. MwSt., zzgl. Kurabgabe der Gemeinde Großenbrode.</p>';
      updateBar();
    }

    // Mobile Leiste: Preis immer sichtbar, Aktion passt sich an
    var formInView = false;
    function updateBar() {
      if (!bar) return;
      var label = bar.querySelector("[data-bb-label]"), total = bar.querySelector("[data-mobile-total]"), act = bar.querySelector("[data-bb-action]");
      if (!state.a || !state.b) {
        label.textContent = "Noch kein Zeitraum gewählt";
        total.textContent = "ab " + fromPrice + " € pro Nacht";
        act.textContent = "Zeitraum wählen";
        act.dataset.mode = "cal";
        return;
      }
      var q = quote(state.a, state.b, { dog: state.dog });
      label.textContent = q.nights + " Nächte ab " + fmtNoYear(state.a);
      total.textContent = eur(q.total);
      act.textContent = formInView ? "Anfrage senden" : "Weiter zu Ihren Daten";
      act.dataset.mode = formInView ? "submit" : "form";
    }
    if (bar) {
      bar.querySelector("[data-bb-action]").addEventListener("click", function () {
        var mode = this.dataset.mode;
        if (mode === "cal") calB.scrollIntoView({ behavior: "smooth", block: "start" });
        else if (mode === "form") { form.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { form.querySelector("[name=vorname]").focus({ preventScroll: true }); }, 500); }
        else if (form.requestSubmit) form.requestSubmit(); else form.querySelector("[type=submit]").click();
      });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { formInView = en[0].isIntersecting; updateBar(); }, { threshold: 0.25 }).observe(form);
      }
    }
    renderSummary();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!state.a || !state.b) {
        bcal.message = "Bitte wählen Sie zuerst Ihren Reisezeitraum.";
        bcal.renderHint();
        calB.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!validate(form)) return;
      var q = quote(state.a, state.b, { dog: state.dog });
      var ok = document.querySelector("[data-booking-success]");
      ok.querySelector("[data-ref]").textContent = "Anfrage " + refNo();
      ok.querySelector("[data-name]").textContent = form.querySelector("[name=vorname]").value.trim();
      ok.querySelector("[data-mail]").textContent = form.querySelector("[name=email]").value.trim();
      ok.querySelector("[data-s-dates]").textContent = fmtDow(state.a) + state.a.getFullYear() + " – " + fmtDow(state.b) + state.b.getFullYear() + " (" + q.nights + " Nächte)";
      ok.querySelector("[data-s-guests]").textContent = guestsText();
      ok.querySelector("[data-s-total]").textContent = eur(q.total) + (state.linen ? " (Wäschepaket nach Angebot)" : "");
      if (!PRESENT) {
        var fv = function (n) { var el = form.querySelector("[name=" + n + "]"); return el ? el.value.trim() : ""; };
        var addr = [fv("strasse"), (fv("plz") + " " + fv("ort")).trim(), fv("land")].filter(Boolean).join(", ");
        openMail("Buchungsanfrage Ferienwohnung Meerblick: " + fmtNoYear(state.a) + " – " + fmtNoYear(state.b) + state.b.getFullYear(),
          "Hallo Petra und Mirko,\n\nich möchte die Ferienwohnung Meerblick anfragen:\n\n" +
          "Anreise: " + fmtDow(state.a) + state.a.getFullYear() + "\n" +
          "Abreise: " + fmtDow(state.b) + state.b.getFullYear() + " (" + q.nights + " Nächte)\n" +
          "Gäste: " + guestsText() + "\n" +
          "Preis laut Website: " + eur(q.total) + " inkl. Endreinigung, zzgl. Kurabgabe\n\n" +
          "Name: " + fv("vorname") + " " + fv("nachname") + "\n" +
          "E-Mail: " + fv("email") + "\n" +
          (fv("telefon") ? "Telefon: " + fv("telefon") + "\n" : "") +
          (addr ? "Anschrift: " + addr + "\n" : "") +
          (fv("nachricht") ? "\nNachricht:\n" + fv("nachricht") + "\n" : "") +
          "\nViele Grüße\n" + fv("vorname"));
        ok.querySelector("[data-ref]").textContent = "Anfrage vorbereitet";
        ok.querySelector(".success__lead").innerHTML = "Ihr E-Mail-Programm hat Ihre fertige Anfrage an uns geöffnet. Bitte senden Sie die E-Mail ab, dann prüfen wir den Zeitraum und schicken Ihnen die Bestätigung an <b></b>.";
        ok.querySelector(".success__lead b").textContent = fv("email");
      }
      booking.hidden = true;
      if (bar) bar.hidden = true;
      document.querySelector("[data-steps]").querySelectorAll("li").forEach(function (li, i) { li.className = i < 2 ? "is-done" : "is-active"; });
      ok.classList.add("is-visible");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
