const API_BASE = 'https://data.cms.gov/data-api/v1/dataset/4c99e737-3dc1-45b1-b737-e9e9a221a661/data';

let cache = {};

async function fetchAPI(params = {}) {
  const key = JSON.stringify(params);
  if (cache[key]) return cache[key];
  const url = new URL(API_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  cache[key] = data;
  return data;
}

function num(v) { return parseInt(v) || 0; }

const MONTH_ORDER = { 'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06', 'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12' };
function sortKey(r) { return `${r.YEAR}-${MONTH_ORDER[r.MONTH] || '00'}`; }

export async function getLatestNational(view) {
  // Fetch national monthly records (not "Year" aggregates), get the most recent
  const data = await fetchAPI({
    'filter[BENE_GEO_LVL]': 'National',
    size: 5000
  });
  const monthly = data.filter(r => r.MONTH !== 'Year');
  monthly.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  if (!monthly.length) return [];
  const r = monthly[0];
  if (view === 'medical') {
    return [{ YEAR: r.YEAR, MONTH: r.MONTH, TOT_BENES: num(r.TOT_BENES), FFS: num(r.ORGNL_MDCR_BENES), MA: num(r.MA_AND_OTH_BENES) }];
  }
  return [{ YEAR: r.YEAR, MONTH: r.MONTH, TOT_BENES: num(r.PRSCRPTN_DRUG_TOT_BENES), PDP: num(r.PRSCRPTN_DRUG_PDP_BENES), MAPD: num(r.PRSCRPTN_DRUG_MAPD_BENES) }];
}

export async function getYearlyTrend(view, geoLevel = 'National', state = null) {
  const params = { size: 5000 };
  if (state) {
    params['filter[BENE_GEO_LVL]'] = 'State';
    params['filter[BENE_STATE_ABRVTN]'] = state;
  } else {
    params['filter[BENE_GEO_LVL]'] = 'National';
  }
  const data = await fetchAPI(params);
  const yearly = data.filter(r => r.MONTH === 'Year');
  return yearly.map(r => {
    if (view === 'medical') {
      return { YEAR: r.YEAR, TOTAL: num(r.TOT_BENES), FFS: num(r.ORGNL_MDCR_BENES), MA: num(r.MA_AND_OTH_BENES) };
    }
    return { YEAR: r.YEAR, TOTAL: num(r.PRSCRPTN_DRUG_TOT_BENES), PDP: num(r.PRSCRPTN_DRUG_PDP_BENES), MAPD: num(r.PRSCRPTN_DRUG_MAPD_BENES) };
  }).sort((a, b) => a.YEAR.localeCompare(b.YEAR));
}

export async function getMonthlyTrend(view, geoLevel = 'National', state = null) {
  const params = { size: 5000 };
  if (state) {
    params['filter[BENE_GEO_LVL]'] = 'State';
    params['filter[BENE_STATE_ABRVTN]'] = state;
  } else {
    params['filter[BENE_GEO_LVL]'] = 'National';
  }
  const data = await fetchAPI(params);
  const monthly = data.filter(r => r.MONTH !== 'Year');
  monthly.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  return monthly.slice(0, 12).map(r => {
    if (view === 'medical') {
      return { YEAR: r.YEAR, MONTH: r.MONTH, TOTAL: num(r.TOT_BENES), FFS: num(r.ORGNL_MDCR_BENES), MA: num(r.MA_AND_OTH_BENES) };
    }
    return { YEAR: r.YEAR, MONTH: r.MONTH, TOTAL: num(r.PRSCRPTN_DRUG_TOT_BENES), PDP: num(r.PRSCRPTN_DRUG_PDP_BENES), MAPD: num(r.PRSCRPTN_DRUG_MAPD_BENES) };
  });
}

export async function getStateData(view) {
  // First find the latest year/month from national data
  const natl = await fetchAPI({ 'filter[BENE_GEO_LVL]': 'National', size: 5000 });
  const monthly = natl.filter(r => r.MONTH !== 'Year');
  monthly.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  if (!monthly.length) return [];
  const { YEAR, MONTH } = monthly[0];

  const data = await fetchAPI({
    'filter[BENE_GEO_LVL]': 'State',
    'filter[YEAR]': YEAR,
    'filter[MONTH]': MONTH,
    size: 5000
  });
  return data.map(r => {
    if (view === 'medical') {
      return { state: r.BENE_STATE_ABRVTN, name: r.BENE_STATE_DESC, fips: r.BENE_FIPS_CD, TOTAL: num(r.TOT_BENES), FFS: num(r.ORGNL_MDCR_BENES), MA: num(r.MA_AND_OTH_BENES) };
    }
    return { state: r.BENE_STATE_ABRVTN, name: r.BENE_STATE_DESC, fips: r.BENE_FIPS_CD, TOTAL: num(r.PRSCRPTN_DRUG_TOT_BENES), PDP: num(r.PRSCRPTN_DRUG_PDP_BENES), MAPD: num(r.PRSCRPTN_DRUG_MAPD_BENES) };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCountyData(view, state) {
  const natl = await fetchAPI({ 'filter[BENE_GEO_LVL]': 'National', size: 5000 });
  const monthly = natl.filter(r => r.MONTH !== 'Year');
  monthly.sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  if (!monthly.length) return [];
  const { YEAR, MONTH } = monthly[0];

  const data = await fetchAPI({
    'filter[BENE_GEO_LVL]': 'County',
    'filter[BENE_STATE_ABRVTN]': state,
    'filter[YEAR]': YEAR,
    'filter[MONTH]': MONTH,
    size: 5000
  });
  return data.map(r => {
    if (view === 'medical') {
      return { county: r.BENE_COUNTY_DESC, fips: r.BENE_FIPS_CD, TOTAL: num(r.TOT_BENES), FFS: num(r.ORGNL_MDCR_BENES), MA: num(r.MA_AND_OTH_BENES) };
    }
    return { county: r.BENE_COUNTY_DESC, fips: r.BENE_FIPS_CD, TOTAL: num(r.PRSCRPTN_DRUG_TOT_BENES), PDP: num(r.PRSCRPTN_DRUG_PDP_BENES), MAPD: num(r.PRSCRPTN_DRUG_MAPD_BENES) };
  }).sort((a, b) => a.county.localeCompare(b.county));
}
