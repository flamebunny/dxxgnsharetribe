import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { isErrorUserPendingApproval, isForbiddenError, storableError } from '../../util/errors';
import { createImageVariantConfig } from '../../util/sdkLoader';
import {
  parseDateFromISO8601,
  getExclusiveEndDate,
  addTime,
  subtractTime,
  daysBetween,
  getStartOf,
} from '../../util/dates';
export const ASSET_NAME = 'landing-page';
export const masonarySectionId = 'new-listing-masonary';
export const textblurbSectionId = 'new-listing-textblurb';
export const newSectionId = 'new-listings';
export const fashionSectionId = 'fashion-listings';
export const featuredSectionId = 'featured-listings';
export const heroimgcustomSectionId = 'hero-img-custom';
export const textlinksSectionId = 'new-listing-textlinks';
export const columnsTextSectionId = 'landingpage-columnstext';
export const categoriesSectionId = 'landingpage-categories';

import { searchListings } from '../SearchPage/SearchPage.duck';

import { constructQueryParamName, isOriginInUse, isStockInUse } from '../../util/search';
import { hasPermissionToViewData, isUserAuthorized } from '../../util/userHelpers';
import { parse } from '../../util/urlHelpers';

import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 12 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 24;

// ================ Action types ================ //

export const FETCH_FEATURED_ASSETS_SUCCESS = 'app/LandingPage/FETCH_FEATURED_ASSETS_SUCCESS';
export const FETCH_NEW_ASSETS_SUCCESS = 'app/LandingPage/FETCH_NEW_ASSETS_SUCCESS';

export const LANDINGPAGE_FEATURED_LISTINGS_REQUEST = 'app/LandingPage/LANDINGPAGE_FEATURED_LISTINGS_REQUEST';
export const LANDINGPAGE_FEATURED_LISTINGS_SUCCESS = 'app/LandingPage/LANDINGPAGE_FEATURED_LISTINGS_SUCCESS';
export const LANDINGPAGE_FEATURED_LISTINGS_ERROR = 'app/LandingPage/LANDINGPAGE_FEATURED_LISTINGS_ERROR';

export const SEARCH_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_LISTINGS_REQUEST';
export const SEARCH_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_LISTINGS_SUCCESS';
export const SEARCH_LISTINGS_ERROR = 'app/SearchPage/SEARCH_LISTINGS_ERROR';

export const SEARCH_MAP_LISTINGS_REQUEST = 'app/SearchPage/SEARCH_MAP_LISTINGS_REQUEST';
export const SEARCH_MAP_LISTINGS_SUCCESS = 'app/SearchPage/SEARCH_MAP_LISTINGS_SUCCESS';
export const SEARCH_MAP_LISTINGS_ERROR = 'app/SearchPage/SEARCH_MAP_LISTINGS_ERROR';

export const SEARCH_MAP_SET_ACTIVE_LISTING = 'app/SearchPage/SEARCH_MAP_SET_ACTIVE_LISTING';

// ================ Reducer ================ //

const initialState = {
  featuredListingIds: [],
  currentPageResultIds: [],
};

const resultIds = data => {
  const listings = data.data;
  return listings
    .filter(l => !l.attributes.deleted && l.attributes.state === 'published')
    .map(l => l.id);
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case FETCH_FEATURED_ASSETS_SUCCESS:
      return {
        ...state,
        featuredListingIds: payload.ids,
      };

    case FETCH_NEW_ASSETS_SUCCESS:
      return state;

    case LANDINGPAGE_FEATURED_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case LANDINGPAGE_FEATURED_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case LANDINGPAGE_FEATURED_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchInProgress: false, searchListingsError: payload };




    case SEARCH_LISTINGS_REQUEST:
      return {
        ...state,
        searchParams: payload.searchParams,
        searchInProgress: true,
        searchMapListingIds: [],
        searchListingsError: null,
      };
    case SEARCH_LISTINGS_SUCCESS:
      return {
        ...state,
        currentPageResultIds: resultIds(payload.data),
        pagination: payload.data.meta,
        searchInProgress: false,
      };
    case SEARCH_LISTINGS_ERROR:
      // eslint-disable-next-line no-console
      console.error(payload);
      return { ...state, searchInProgress: false, searchListingsError: payload };


    default:
      return state;
  }
}

// ================ Action creators ================ //

export const fetchFeaturedAssetsSuccess = ids => ({
  type: FETCH_FEATURED_ASSETS_SUCCESS,
  payload: { ids },
});

export const fetchNewAssetsSuccess = ids => ({
  type: FETCH_NEW_ASSETS_SUCCESS,
  payload: { ids },
});

export const searchFeaturedListingsRequest = searchParams => ({
  type: LANDINGPAGE_FEATURED_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const searchFeaturedListingsSuccess = response => ({
  type: LANDINGPAGE_FEATURED_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchFeaturedListingsError = e => ({
  type: LANDINGPAGE_FEATURED_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const searchListingsRequest = searchParams => ({
  type: SEARCH_LISTINGS_REQUEST,
  payload: { searchParams },
});

export const searchListingsSuccess = response => ({
  type: SEARCH_LISTINGS_SUCCESS,
  payload: { data: response.data },
});

export const searchListingsError = e => ({
  type: SEARCH_LISTINGS_ERROR,
  error: true,
  payload: e,
});

export const landingpageFeaturedListings = (searchParams, config) => (dispatch, getState, sdk) => {

  dispatch(searchFeaturedListingsRequest(searchParams));

  // SearchPage can enforce listing query to only those listings with valid listingType
  // NOTE: this only works if you have set 'enum' type search schema to listing's public data fields
  //       - listingType
  //       Same setup could be expanded to 2 other extended data fields:
  //       - transactionProcessAlias
  //       - unitType
  //       ...and then turned enforceValidListingType config to true in configListing.js
  // Read More:
  // https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-flex-cli/#adding-listing-search-schemas
  const searchValidListingTypes = listingTypes => {
    return config.listing.enforceValidListingType
      ? {
          pub_listingType: listingTypes.map(l => l.listingType),
          // pub_transactionProcessAlias: listingTypes.map(l => l.transactionType.alias),
          // pub_unitType: listingTypes.map(l => l.transactionType.unitType),
        }
      : {};
  };

  const omitInvalidCategoryParams = params => {
    const categoryConfig = config.search.defaultFilters?.find(f => f.schemaType === 'category');
    const categories = config.categoryConfiguration.categories;
    const { key: prefix, scope } = categoryConfig || {};
    const categoryParamPrefix = constructQueryParamName(prefix, scope);

    const validURLParamForCategoryData = (prefix, categories, level, params) => {
      const levelKey = `${categoryParamPrefix}${level}`;
      const levelValue = params?.[levelKey];
      const foundCategory = categories.find(cat => cat.id === levelValue);
      const subcategories = foundCategory?.subcategories || [];
      return foundCategory && subcategories.length > 0
        ? {
            [levelKey]: levelValue,
            ...validURLParamForCategoryData(prefix, subcategories, level + 1, params),
          }
        : foundCategory
        ? { [levelKey]: levelValue }
        : {};
    };

    const categoryKeys = validURLParamForCategoryData(prefix, categories, 1, params);
    const nonCategoryKeys = Object.entries(params).reduce(
      (picked, [k, v]) => (k.startsWith(categoryParamPrefix) ? picked : { ...picked, [k]: v }),
      {}
    );

    return { ...nonCategoryKeys, ...categoryKeys };
  };

  const priceSearchParams = priceParam => {
    const inSubunits = value => convertUnitToSubUnit(value, unitDivisor(config.currency));
    const values = priceParam ? priceParam.split(',') : [];
    return priceParam && values.length === 2
      ? {
          price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
        }
      : {};
  };

  const datesSearchParams = datesParam => {
    const searchTZ = 'Etc/UTC';
    const datesFilter = config.search.defaultFilters.find(f => f.key === 'dates');
    const values = datesParam ? datesParam.split(',') : [];
    const hasValues = datesFilter && datesParam && values.length === 2;
    const { dateRangeMode, availability } = datesFilter || {};
    const isNightlyMode = dateRangeMode === 'night';
    const isEntireRangeAvailable = availability === 'time-full';

    // SearchPage need to use a single time zone but listings can have different time zones
    // We need to expand/prolong the time window (start & end) to cover other time zones too.
    //
    // NOTE: you might want to consider changing UI so that
    //   1) location is always asked first before date range
    //   2) use some 3rd party service to convert location to time zone (IANA tz name)
    //   3) Make exact dates filtering against that specific time zone
    //   This setup would be better for dates filter,
    //   but it enforces a UX where location is always asked first and therefore configurability
    const getProlongedStart = date => subtractTime(date, 14, 'hours', searchTZ);
    const getProlongedEnd = date => addTime(date, 12, 'hours', searchTZ);

    const startDate = hasValues ? parseDateFromISO8601(values[0], searchTZ) : null;
    const endRaw = hasValues ? parseDateFromISO8601(values[1], searchTZ) : null;
    const endDate =
      hasValues && isNightlyMode
        ? endRaw
        : hasValues
        ? getExclusiveEndDate(endRaw, searchTZ)
        : null;

    const today = getStartOf(new Date(), 'day', searchTZ);
    const possibleStartDate = subtractTime(today, 14, 'hours', searchTZ);
    const hasValidDates =
      hasValues &&
      startDate.getTime() >= possibleStartDate.getTime() &&
      startDate.getTime() <= endDate.getTime();

    const dayCount = isEntireRangeAvailable ? daysBetween(startDate, endDate) : 1;
    const day = 1440;
    const hour = 60;
    // When entire range is required to be available, we count minutes of included date range,
    // but there's a need to subtract one hour due to possibility of daylight saving time.
    // If partial range is needed, then we just make sure that the shortest time unit supported
    // is available within the range.
    // You might want to customize this to match with your time units (e.g. day: 1440 - 60)
    const minDuration = isEntireRangeAvailable ? dayCount * day - hour : hour;
    return hasValidDates
      ? {
          start: getProlongedStart(startDate),
          end: getProlongedEnd(endDate),
          // Availability can be time-full or time-partial.
          // However, due to prolonged time window, we need to use time-partial.
          availability: 'time-partial',
          // minDuration uses minutes
          minDuration,
        }
      : {};
  };

  const stockFilters = datesMaybe => {
    const hasDatesFilterInUse = Object.keys(datesMaybe).length > 0;

    // If dates filter is not in use,
    //   1) Add minStock filter with default value (1)
    //   2) Add relaxed stockMode: "match-undefined"
    // The latter is used to filter out all the listings that explicitly are out of stock,
    // but keeps bookable and inquiry listings.
    return hasDatesFilterInUse ? {} : { minStock: 1, stockMode: 'match-undefined' };
  };

  const { perPage, price, dates, sort, mapSearch, ...restOfParams } = searchParams;
  const priceMaybe = priceSearchParams(price);
  const datesMaybe = datesSearchParams(dates);
  const stockMaybe = stockFilters(datesMaybe);
  const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };

  const params = {
    // The rest of the params except invalid nested category-related params
    // Note: invalid independent search params are still passed through
    ...omitInvalidCategoryParams(restOfParams),
    ...priceMaybe,
    ...datesMaybe,
    ...stockMaybe,
    ...sortMaybe,
    ...searchValidListingTypes(config.listing.listingTypes),
    perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };     

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      dispatch(searchFeaturedListingsSuccess(response));
      return response;
    })
    .catch(e => {
      const error = storableError(e);
      dispatch(searchFeaturedListingsError(error));
      if (!(isErrorUserPendingApproval(error) || isForbiddenError(error))) {
        throw e;
      }
    });
};

export const getNewListingParams = (config) => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;

  return {    
    page: 1,
    perPage: 12,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'price',
      'deleted',
      'state',
      'publicData.listingType',
      'publicData.transactionProcessAlias',
      'publicData.unitType',
      // These help rendering of 'purchase' listings,
      // when transitioning from search page to listing page
      'publicData.pickupEnabled',
      'publicData.shippingEnabled',
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

export const getFashionListingParams = (config) => {
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;

  return {    
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
    'pub_categoryLevel1': 'fashion',
    'totalItems': 5,
  };
};

export const getFeaturedListingParams = (config, listingIds) => {

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const aspectRatio = aspectHeight / aspectWidth;

  return {
    ids: listingIds,
    page: 1,
    perPage: 15,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'price',
      'deleted',
      'state',
      'publicData.listingType',
      'publicData.transactionProcessAlias',
      'publicData.unitType',
      // These help rendering of 'purchase' listings,
      // when transitioning from search page to listing page
      'publicData.pickupEnabled',
      'publicData.shippingEnabled',
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


export const searchListings2 = (searchParams, config) => (dispatch, getState, sdk) => {

  dispatch(searchListingsRequest(searchParams));

  // SearchPage can enforce listing query to only those listings with valid listingType
  // NOTE: this only works if you have set 'enum' type search schema to listing's public data fields
  //       - listingType
  //       Same setup could be expanded to 2 other extended data fields:
  //       - transactionProcessAlias
  //       - unitType
  //       ...and then turned enforceValidListingType config to true in configListing.js
  // Read More:
  // https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-flex-cli/#adding-listing-search-schemas
  const searchValidListingTypes = listingTypes => {
    return config.listing.enforceValidListingType
      ? {
          pub_listingType: listingTypes.map(l => l.listingType),
          // pub_transactionProcessAlias: listingTypes.map(l => l.transactionType.alias),
          // pub_unitType: listingTypes.map(l => l.transactionType.unitType),
        }
      : {};
  };

  const omitInvalidCategoryParams = params => {
    const categoryConfig = config.search.defaultFilters?.find(f => f.schemaType === 'category');
    const categories = config.categoryConfiguration.categories;
    const { key: prefix, scope } = categoryConfig || {};
    const categoryParamPrefix = constructQueryParamName(prefix, scope);

    const validURLParamForCategoryData = (prefix, categories, level, params) => {
      const levelKey = `${categoryParamPrefix}${level}`;
      const levelValue = params?.[levelKey];
      const foundCategory = categories.find(cat => cat.id === levelValue);
      const subcategories = foundCategory?.subcategories || [];
      return foundCategory && subcategories.length > 0
        ? {
            [levelKey]: levelValue,
            ...validURLParamForCategoryData(prefix, subcategories, level + 1, params),
          }
        : foundCategory
        ? { [levelKey]: levelValue }
        : {};
    };

    const categoryKeys = validURLParamForCategoryData(prefix, categories, 1, params);
    const nonCategoryKeys = Object.entries(params).reduce(
      (picked, [k, v]) => (k.startsWith(categoryParamPrefix) ? picked : { ...picked, [k]: v }),
      {}
    );

    return { ...nonCategoryKeys, ...categoryKeys };
  };

  const priceSearchParams = priceParam => {
    const inSubunits = value => convertUnitToSubUnit(value, unitDivisor(config.currency));
    const values = priceParam ? priceParam.split(',') : [];
    return priceParam && values.length === 2
      ? {
          price: [inSubunits(values[0]), inSubunits(values[1]) + 1].join(','),
        }
      : {};
  };

  const datesSearchParams = datesParam => {
    const searchTZ = 'Etc/UTC';
    const datesFilter = config.search.defaultFilters.find(f => f.key === 'dates');
    const values = datesParam ? datesParam.split(',') : [];
    const hasValues = datesFilter && datesParam && values.length === 2;
    const { dateRangeMode, availability } = datesFilter || {};
    const isNightlyMode = dateRangeMode === 'night';
    const isEntireRangeAvailable = availability === 'time-full';

    // SearchPage need to use a single time zone but listings can have different time zones
    // We need to expand/prolong the time window (start & end) to cover other time zones too.
    //
    // NOTE: you might want to consider changing UI so that
    //   1) location is always asked first before date range
    //   2) use some 3rd party service to convert location to time zone (IANA tz name)
    //   3) Make exact dates filtering against that specific time zone
    //   This setup would be better for dates filter,
    //   but it enforces a UX where location is always asked first and therefore configurability
    const getProlongedStart = date => subtractTime(date, 14, 'hours', searchTZ);
    const getProlongedEnd = date => addTime(date, 12, 'hours', searchTZ);

    const startDate = hasValues ? parseDateFromISO8601(values[0], searchTZ) : null;
    const endRaw = hasValues ? parseDateFromISO8601(values[1], searchTZ) : null;
    const endDate =
      hasValues && isNightlyMode
        ? endRaw
        : hasValues
        ? getExclusiveEndDate(endRaw, searchTZ)
        : null;

    const today = getStartOf(new Date(), 'day', searchTZ);
    const possibleStartDate = subtractTime(today, 14, 'hours', searchTZ);
    const hasValidDates =
      hasValues &&
      startDate.getTime() >= possibleStartDate.getTime() &&
      startDate.getTime() <= endDate.getTime();

    const dayCount = isEntireRangeAvailable ? daysBetween(startDate, endDate) : 1;
    const day = 1440;
    const hour = 60;
    // When entire range is required to be available, we count minutes of included date range,
    // but there's a need to subtract one hour due to possibility of daylight saving time.
    // If partial range is needed, then we just make sure that the shortest time unit supported
    // is available within the range.
    // You might want to customize this to match with your time units (e.g. day: 1440 - 60)
    const minDuration = isEntireRangeAvailable ? dayCount * day - hour : hour;
    return hasValidDates
      ? {
          start: getProlongedStart(startDate),
          end: getProlongedEnd(endDate),
          // Availability can be time-full or time-partial.
          // However, due to prolonged time window, we need to use time-partial.
          availability: 'time-partial',
          // minDuration uses minutes
          minDuration,
        }
      : {};
  };

  const stockFilters = datesMaybe => {
    const hasDatesFilterInUse = Object.keys(datesMaybe).length > 0;

    // If dates filter is not in use,
    //   1) Add minStock filter with default value (1)
    //   2) Add relaxed stockMode: "match-undefined"
    // The latter is used to filter out all the listings that explicitly are out of stock,
    // but keeps bookable and inquiry listings.
    return hasDatesFilterInUse ? {} : { minStock: 1, stockMode: 'match-undefined' };
  };

  const { perPage, price, dates, sort, mapSearch, ...restOfParams } = searchParams;
  const priceMaybe = priceSearchParams(price);
  const datesMaybe = datesSearchParams(dates);
  const stockMaybe = stockFilters(datesMaybe);
  const sortMaybe = sort === config.search.sortConfig.relevanceKey ? {} : { sort };

  const params = {
    // The rest of the params except invalid nested category-related params
    // Note: invalid independent search params are still passed through
    ...omitInvalidCategoryParams(restOfParams),
    ...priceMaybe,
    ...datesMaybe,
    ...stockMaybe,
    ...sortMaybe,
    ...searchValidListingTypes(config.listing.listingTypes),
    perPage,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };

      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      dispatch(searchListingsSuccess(response));
      return response;
    })
    .catch(e => {
      const error = storableError(e);
      dispatch(searchListingsError(error));
      if (!(isErrorUserPendingApproval(error) || isForbiddenError(error))) {
        throw e;
      }
    });
};

export const loadData = (params, search, config) => (dispatch, getState, sdk) => {


  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };

  const queryParams = parse(search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });

  const { page = 1, address, origin, ...rest } = queryParams;
  const originMaybe = isOriginInUse(config) && origin ? { origin } : {};

  let {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  aspectWidth = 1;
  aspectHeight = 1;
  
  const aspectRatio = aspectHeight / aspectWidth;

  const searchListingsCall = searchListings(
    {      
      page,
      perPage: RESULT_PAGE_SIZE,
      include: ['author', 'images'],
      'fields.listing': [
        'title',
        'geolocation',
        'price',
        'deleted',
        'state',
        'publicData.listingType',
        'publicData.transactionProcessAlias',
        'publicData.unitType',
        // These help rendering of 'purchase' listings,
        // when transitioning from search page to listing page
        'publicData.pickupEnabled',
        'publicData.shippingEnabled',
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
    },
    config
  );

  const paramsNew = getNewListingParams(config);

  return dispatch(fetchPageAssets(pageAsset, true)).then(assetResp => {
    assetResp.landingPage?.data?.sections.map((section, idx) =>{
      
      if (section.sectionId === featuredSectionId) {        
        const featuredListingIds = section?.blocks.map(b => b.blockName);
        dispatch(fetchFeaturedAssetsSuccess(featuredListingIds));        
      } else if (section.sectionId === newSectionId) {    
        // dispatch(searchListingsCall);
        // dispatch(searchListings(paramsNew, config))
      }else{

      }
    })
  });

};


