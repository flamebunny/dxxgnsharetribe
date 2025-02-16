import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { createImageVariantConfig } from '../../util/sdkLoader';
export const ASSET_NAME = 'landing-page';
export const masonarySectionId = 'new-listing-masonary';
export const textblurbSectionId = 'new-listing-textblurb';
export const recommendedSectionId = 'recommended-listings';
export const heroimgcustomSectionId = 'hero-img-custom';

// ================ Action types ================ //

export const FETCH_ASSETS_SUCCESS = 'app/LandingPage/FETCH_ASSETS_SUCCESS';

// ================ Reducer ================ //

const initialState = {
  recommendedListingIds: [],
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_ASSETS_SUCCESS:
      return {
        ...state,
        recommendedListingIds: payload.ids,
      };

    default:
      return state;
  }
}

// ================ Action creators ================ //

export const fetchAssetsSuccess = ids => ({
  type: FETCH_ASSETS_SUCCESS,
  payload: { ids },
});

export const getRecommendedListingParams = (config, listingIds) => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;

  return {
    ids: listingIds,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'price',
      'deleted',
      'state',
      'publicData.transactionProcessAlias'
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
  };
};

export const loadData = (params, search) => dispatch => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };

  return dispatch(fetchPageAssets(pageAsset, true)).then(assetResp => {
    // Get listing ids from custom recommended listings section

    console.log(assetResp.landingPage?.data?.sections);

    const customSection = assetResp.landingPage?.data?.sections.filter(
      s => [recommendedSectionId, masonarySectionId].includes(s.sectionId)
    );

    console.log('customSection');
    console.log(customSection)

    if (customSection) {
      const recommendedListingIds = customSection?.blocks.map(b => b.blockName);
      dispatch(fetchAssetsSuccess(recommendedListingIds));
    }
  });
};