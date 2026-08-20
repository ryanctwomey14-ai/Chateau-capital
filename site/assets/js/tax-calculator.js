/* ==========================================================================
   Chateau Capital | Tax Drag Calculator
   --------------------------------------------------------------------------
   Illustrative only. Not tax advice. Every assumption is exposed in the UI so
   a CPA can check the arithmetic rather than trust a black box.

   TWO DELIBERATE DEPARTURES from the calculators commonly seen in this
   category, both of which make the output smaller and more defensible:

   1. TAX SAVING IS COMPUTED PROPERLY. Many tools multiply the depreciation
      deduction by the taxpayer's top marginal rate. That overstates the
      result, because a large deduction drags income down through the lower
      brackets. We recompute tax on the reduced taxable income and take the
      real difference. On a $450k / MFJ / $250k example this is roughly a 20
      percent smaller number, and it is the correct one.

   2. PASSIVE ACTIVITY LOSS RULES ARE APPLIED (IRC section 469). Depreciation
      from a passive limited partnership interest generally cannot shelter W-2
      income. It offsets passive income, and the excess is suspended and
      carried forward. Ignoring this is the single most misleading thing a
      calculator in this category can do, so it is modelled explicitly and the
      carryforward is shown as the real benefit it is.

   TAX YEAR: 2025 figures. Update BRACKETS and STD_DEDUCTION annually.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.getElementById('tax-calc');
  if (!root) return;

  /* --- Tax year data (2025) --------------------------------------------- */
  var TAX_YEAR = 2025;

  // [upper bound of bracket, marginal rate]
  var BRACKETS = {
    single: [[11925,.10],[48475,.12],[103350,.22],[197300,.24],[250525,.32],[626350,.35],[Infinity,.37]],
    mfj:    [[23850,.10],[96950,.12],[206700,.22],[394600,.24],[501050,.32],[751600,.35],[Infinity,.37]],
    mfs:    [[11925,.10],[48475,.12],[103350,.22],[197300,.24],[250525,.32],[375800,.35],[Infinity,.37]],
    hoh:    [[17000,.10],[64850,.12],[103350,.22],[197300,.24],[250500,.32],[626350,.35],[Infinity,.37]]
  };
  var STD_DEDUCTION = { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 };

  // Top marginal state rate, used as an estimate. State brackets vary widely
  // and several states tax differently again; this is deliberately a rough cut.
  var STATE_RATE = {
    "": 0, AL:5.00, AK:0, AZ:2.50, AR:3.90, CA:13.30, CO:4.40, CT:6.99, DE:6.60,
    DC:10.75, FL:0, GA:5.39, HI:11.00, ID:5.695, IL:4.95, IN:3.05, IA:3.80,
    KS:5.70, KY:4.00, LA:3.00, ME:7.15, MD:5.75, MA:9.00, MI:4.25, MN:9.85,
    MS:4.70, MO:4.70, MT:5.90, NE:5.20, NV:0, NH:0, NJ:10.75, NM:5.90, NY:10.90,
    NC:4.25, ND:2.50, OH:3.50, OK:4.75, OR:9.90, PA:3.07, RI:5.99, SC:6.20,
    SD:0, TN:0, TX:0, UT:4.55, VT:8.75, VA:5.75, WA:0, WV:4.82, WI:7.65, WY:0
  };
  var STATE_NAME = {
    AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
    CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",
    HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",
    LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
    MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
    NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",
    OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",
    SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",
    VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"
  };

  /* --- Helpers ----------------------------------------------------------- */
  function progressiveTax(taxable, table) {
    if (taxable <= 0) return 0;
    var tax = 0, floor = 0;
    for (var i = 0; i < table.length; i++) {
      var cap = table[i][0], rate = table[i][1];
      if (taxable > floor) tax += (Math.min(taxable, cap) - floor) * rate;
      floor = cap;
      if (taxable <= cap) break;
    }
    return tax;
  }
  function marginalRate(taxable, table) {
    for (var i = 0; i < table.length; i++) if (taxable <= table[i][0]) return table[i][1];
    return table[table.length - 1][1];
  }
  function usd(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function pct(n, dp) {
    return (n * 100).toFixed(dp === undefined ? 1 : dp) + "%";
  }
  function num(el) {
    var v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ""));
    return isNaN(v) ? 0 : v;
  }

  /* --- Elements ---------------------------------------------------------- */
  var el = {};
  ["income","bonus","filing","state","amount","amountOut","costseg","bonusrate",
   "usage","passiveIncome","passiveWrap","ltv","land","segshare","months",
   "assumptionsToggle","assumptionsPanel"].forEach(function (k) {
    el[k] = root.querySelector('[data-f="' + k + '"]');
  });
  function out(k) { return root.querySelector('[data-o="' + k + '"]'); }

  /* --- Model ------------------------------------------------------------- */
  function computeDepreciation(investment, opts) {
    // Equity controls a larger asset because the deal carries debt.
    var propertyBasis = opts.ltv >= 1 ? investment : investment / (1 - opts.ltv);
    var buildingBasis = propertyBasis * (1 - opts.land);   // land is not depreciable
    var monthsFactor = Math.min(12, Math.max(0, opts.months)) / 12;

    var bonusPortion = 0, shortLifeBasis = 0;
    if (opts.costSeg) {
      shortLifeBasis = buildingBasis * opts.segShare;
      bonusPortion = shortLifeBasis * opts.bonusRate;
    }
    // Whatever the bonus did not take still depreciates, on its own schedule.
    var shortLifeRemainder = shortLifeBasis - bonusPortion;
    var longLifeBasis = buildingBasis - shortLifeBasis;

    var straightLine = (longLifeBasis / 27.5) * monthsFactor;
    var shortLineRest = (shortLifeRemainder / 7) * monthsFactor;

    return {
      propertyBasis: propertyBasis,
      buildingBasis: buildingBasis,
      bonusPortion: bonusPortion,
      year1: bonusPortion + straightLine + shortLineRest
    };
  }

  function computeScenario(investment, base, opts) {
    var dep = computeDepreciation(investment, opts);

    // IRC 469. A passive loss offsets passive income. The excess is suspended
    // and carried forward against future passive income or gain on disposal.
    var deductible, suspended;
    if (opts.usage === "material") {
      deductible = dep.year1;               // REPS / material participation
      suspended = 0;
    } else {
      deductible = Math.min(dep.year1, opts.passiveIncome);
      suspended = dep.year1 - deductible;
    }

    var mRate = marginalRate(base.taxableIncome, base.table) + base.stateRate;
    var newTaxable = Math.max(0, base.taxableIncome - deductible);
    var newFederal = progressiveTax(newTaxable, base.table);
    var newState = newTaxable * base.stateRate;
    var newTotal = newFederal + newState;

    return {
      depreciation: dep.year1,
      deductible: deductible,
      suspended: suspended,
      newTotalTax: newTotal,
      // The honest figure: the actual change in tax, not deduction x top rate.
      saving: base.totalTax - newTotal,
      newEffective: base.grossIncome > 0 ? newTotal / base.grossIncome : 0,
      // Deferred, not current. Released against future passive income or on sale.
      carryforwardValue: suspended * mRate
    };
  }

  /* --- Render ------------------------------------------------------------ */
  function render() {
    var filing = el.filing.value;
    var table = BRACKETS[filing] || BRACKETS.mfj;
    var grossIncome = num(el.income) + num(el.bonus);
    var stdDed = STD_DEDUCTION[filing] || 0;
    var taxableIncome = Math.max(0, grossIncome - stdDed);

    var stateCode = el.state.value;
    var stateRate = (STATE_RATE[stateCode] || 0) / 100;

    var federalTax = progressiveTax(taxableIncome, table);
    var stateTax = taxableIncome * stateRate;
    var totalTax = federalTax + stateTax;
    var effective = grossIncome > 0 ? totalTax / grossIncome : 0;

    var base = {
      grossIncome: grossIncome, taxableIncome: taxableIncome, table: table,
      stateRate: stateRate, totalTax: totalTax
    };

    // Current burden
    out("gross").textContent = usd(grossIncome);
    out("taxable").textContent = usd(taxableIncome);
    out("bracket").textContent = pct(marginalRate(taxableIncome, table), 0) + " federal bracket";
    out("federal").textContent = usd(federalTax);
    out("stateTax").textContent = usd(stateTax);
    out("stateLabel").textContent = stateCode
      ? "Estimated state tax (" + (STATE_NAME[stateCode] || stateCode) + ")"
      : "Estimated state tax";
    out("total").textContent = usd(totalTax);
    out("effective").textContent = pct(effective);
    out("net").textContent = usd(grossIncome - totalTax);

    // Tax drag
    out("drag").textContent = usd(totalTax);
    var taxPctLabel = pct(effective);
    out("barTax").style.width = Math.min(100, effective * 100) + "%";
    out("barTake").style.width = Math.max(0, 100 - effective * 100) + "%";
    out("barTaxLabel").textContent = taxPctLabel + " taxes";
    out("barTakeLabel").textContent = pct(1 - effective) + " take-home";

    // Investment settings
    var investment = num(el.amount);
    el.amountOut.textContent = usd(investment);
    var opts = {
      ltv: num(el.ltv) / 100,
      land: num(el.land) / 100,
      segShare: num(el.segshare) / 100,
      months: num(el.months),
      costSeg: el.costseg.checked,
      bonusRate: num(el.bonusrate) / 100,
      usage: el.usage.value,
      passiveIncome: num(el.passiveIncome)
    };
    el.passiveWrap.hidden = (opts.usage === "material");

    var r = computeScenario(investment, base, opts);

    out("invAmount").textContent = usd(investment);
    out("depreciation").textContent = usd(r.depreciation);
    out("deductible").textContent = usd(r.deductible);
    out("suspended").textContent = usd(r.suspended);
    out("carryValue").textContent = usd(r.carryforwardValue);
    out("carryRow").hidden = r.suspended <= 1;
    out("newTax").textContent = usd(r.newTotalTax);
    out("newEffective").textContent = pct(r.newEffective);
    out("improvement").textContent = (r.saving > 0 ? "+" : "") + usd(r.saving) + " / yr";

    // Suspended-loss explainer only matters when something is suspended
    var susRow = out("suspendedRow");
    susRow.hidden = r.suspended <= 1;
    var susNote = out("suspendedNote");
    susNote.hidden = r.suspended <= 1;

    // Three scenarios
    [100000, 250000, 500000].forEach(function (amt, i) {
      var sc = computeScenario(amt, base, opts);
      out("s" + i + "Head").textContent = usd(amt);
      out("s" + i + "Dep").textContent = usd(sc.depreciation);
      out("s" + i + "Save").textContent = sc.saving > 0 ? "+" + usd(sc.saving) : usd(0);
      out("s" + i + "Rate").textContent = pct(sc.newEffective);
      out("s" + i + "Gain").textContent = (sc.saving > 0 ? "+" : "") + usd(sc.saving);
    });

    out("taxYear").textContent = TAX_YEAR;
  }

  /* --- Wiring ------------------------------------------------------------ */
  root.addEventListener("input", render);
  root.addEventListener("change", render);

  if (el.assumptionsToggle && el.assumptionsPanel) {
    el.assumptionsToggle.addEventListener("click", function () {
      var open = el.assumptionsToggle.getAttribute("aria-expanded") === "true";
      el.assumptionsToggle.setAttribute("aria-expanded", String(!open));
      el.assumptionsPanel.hidden = open;
    });
  }

  // Populate the state list from the rate table so the two can never drift.
  Object.keys(STATE_NAME).sort(function (a, b) {
    return STATE_NAME[a].localeCompare(STATE_NAME[b]);
  }).forEach(function (code) {
    var o = document.createElement("option");
    o.value = code;
    o.textContent = STATE_NAME[code] + (STATE_RATE[code] ? "" : " (no income tax)");
    el.state.appendChild(o);
  });

  render();
})();
