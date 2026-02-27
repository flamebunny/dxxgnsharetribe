import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'fyi';


export const heroimgcustomSectionId = 'hero-img-custom';
export const articlefyiSectionId = 'article-fyi';
export const articlefyiSection2Id = 'article-fyi2';
export const articlefyiSection3Id = 'article-fyi3';
export const articlefyiSection4Id = 'article-fyi4';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { fyi: `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
