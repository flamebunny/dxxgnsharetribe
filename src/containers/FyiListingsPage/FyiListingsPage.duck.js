import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'fyi-listings';


export const textAccordionSectionId = 'page-textaccordion';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { 'fyiListings': `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
