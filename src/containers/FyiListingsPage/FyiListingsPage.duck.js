import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'fyi';


export const fyiListingsSectionId = 'fyi-listings';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { fyi: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
