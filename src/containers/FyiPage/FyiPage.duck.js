import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
export const ASSET_NAME = 'fyi-overview';


export const textAccordionSectionId = 'page-textaccordion';

export const loadData = (params, search) => dispatch => {
  const pageAsset = { 'fyiOverview': `content/pages/${ASSET_NAME}.json` };
  return dispatch(fetchPageAssets(pageAsset, true));
};
