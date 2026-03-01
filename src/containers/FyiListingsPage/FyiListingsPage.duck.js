import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'fyi-listings';


export const textAccordionSectionId = 'page-textaccordion';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { 'fyiOverview': `content/pages/fyi-overview.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

export const loadDataListings = (params, search) => dispatch => {
  const pageAsset = { 'fyiListings': `content/pages/fyi-listings.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

export const loadDataSelling = (params, search) => dispatch => {
  const pageAsset = { 'fyiSelling': `content/pages/fyi-selling.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

export const loadDataBuying = (params, search) => dispatch => {
  const pageAsset = { 'fyiBuying': `content/pages/fyi-buying.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

export const loadDataShipping = (params, search) => dispatch => {
  const pageAsset = { 'fyiShipping': `content/pages/fyi-shipping.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};

export const loadDataReturns = (params, search) => dispatch => {
  const pageAsset = { 'fyiReturns': `content/pages/fyi-returns.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
