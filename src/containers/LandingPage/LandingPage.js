import React, { useEffect } from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';
import { useConfiguration } from '../../context/configurationContext';
import { types as sdkTypes } from '../../util/sdkLoader';

import FallbackPage from './FallbackPage';
import {
  ASSET_NAME,
  getNewListingParams,
  getFeaturedListingParams,
  featuredSectionId,
  newSectionId,
  masonarySectionId,
  textblurbSectionId,
  heroimgcustomSectionId,
  textlinksSectionId,
  columnsTextSectionId,
  categoriesSectionId,
  carouselNewSectionId,
  landingpageFeaturedListings,
  searchListings2,
} from './LandingPage.duck';
import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import { getFeaturedListingsProps } from '../../util/data';

import SectionTextblurb from '../PageBuilder/SectionBuilder/SectionTextblurb';
import SectionHeroImgCustom from '../PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionTextLinks from '../PageBuilder/SectionBuilder/SectionTextLinks';
import SectionColumnsText from '../PageBuilder/SectionBuilder/SectionColumnsText';
import SectionMasonary from '../PageBuilder/SectionBuilder/SectionMasonary';
import SectionNewListings from '../PageBuilder/SectionBuilder/SectionNewListings';
import SectionFeaturedListings from '../PageBuilder/SectionBuilder/SectionFeaturedListings';
import SectionColumnsCategories from '../PageBuilder/SectionBuilder/SectionColumnsCategories';
import SectionCarouselNew from '../PageBuilder/SectionBuilder/SectionCarouselNew';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const newSectionType = 'new';
const featuredSectionType = 'featured';
const textblurbSectionType = 'textblurb';
const heroimgcustomSectionType = 'heroimgcustom';
const masonarySectionType = 'masonary';
const textlinksSectionType = 'textlinks';
const columnsTextType = 'columnstext';
const categoriesSectionType = 'categories';
const carouselNewSectionType = 'carouselsnew';
const { Money } = sdkTypes;

const idToSdkUuid = uuid => ({
  uuid,
  _sdkType: 'UUID',
});

const addCustomerCommission = (listings = [], customerCommissionPercentage = 0) => {
  if (!customerCommissionPercentage) {
    return listings;
  }

  return listings.map(listing => {
    const price = listing?.attributes?.price;
    if (!price) {
      return listing;
    }

    const priceAmount = Number(price.amount?.toString ? price.amount.toString() : price.amount);
    if (!Number.isFinite(priceAmount)) {
      return listing;
    }

    const priceWithCommission = Math.round(
      priceAmount + priceAmount * (customerCommissionPercentage / 100)
    );

    return {
      ...listing,
      attributes: {
        ...listing.attributes,
        price: new Money(priceWithCommission, price.currency),
      },
    };
  });
};

const getCustomSections = (pageData, listings, featuredListings, categories) => {
  const sections = pageData?.sections;

  if (!Array.isArray(sections)) {
    return pageData;
  }

  const sectionOverrides = {
    [featuredSectionId]: {
      sectionId: featuredSectionId,
      sectionType: featuredSectionType,
      listings: featuredListings,
    },
    [newSectionId]: {
      sectionId: newSectionId,
      sectionType: newSectionType,
      listings,
    },
    [carouselNewSectionId]: {
      sectionId: carouselNewSectionId,
      sectionType: carouselNewSectionType,
      listings,
    },
    [masonarySectionId]: {
      sectionId: masonarySectionId,
      sectionType: masonarySectionType,
    },
    [textblurbSectionId]: {
      sectionId: textblurbSectionId,
      sectionType: textblurbSectionType,
    },
    [heroimgcustomSectionId]: {
      sectionId: heroimgcustomSectionId,
      sectionType: heroimgcustomSectionType,
    },
    [textlinksSectionId]: {
      sectionId: textlinksSectionId,
      sectionType: textlinksSectionType,
    },
    [columnsTextSectionId]: {
      sectionId: columnsTextSectionId,
      sectionType: columnsTextType,
    },
    [categoriesSectionId]: {
      sectionId: categoriesSectionId,
      sectionType: categoriesSectionType,
      allCategories: categories,
    },
  };

  return {
    ...pageData,
    sections: sections.map(section => ({
      ...section,
      ...(sectionOverrides[section.sectionId] || {}),
    })),
  };
};

export const LandingPageComponent = props => {
  const {
    pageAssetsData,
    listings,
    featuredListings,
    featuredListingIds,
    inProgress,
    error,
    onFetchNewListings,
    onFetchCustomFeaturedListings,
  } = props;

  const config = useConfiguration();

  useEffect(() => {
    onFetchNewListings(getNewListingParams(config), config);
  }, [config, onFetchNewListings]);

  useEffect(() => {
    if (featuredListingIds.length > 0) {
      onFetchCustomFeaturedListings(getFeaturedListingParams(config, featuredListingIds), config);
    }
  }, [config, featuredListingIds, onFetchCustomFeaturedListings]);

  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;
  const commissionData = pageAssetsData?.commission?.data;
  const customerCommissionPercentage = commissionData?.customerCommission?.percentage || 0;
  const listingsWithCommission = addCustomerCommission(listings, customerCommissionPercentage);
  const featuredListingsWithCommission = addCustomerCommission(
    featuredListings,
    customerCommissionPercentage
  );
  const customPageData = getCustomSections(
    pageData,
    listingsWithCommission,
    featuredListingsWithCommission,
    config.categoryConfiguration.categories
  );

  return (
    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {
          [newSectionType]: { component: SectionNewListings },
          [featuredSectionType]: { component: SectionFeaturedListings },
          [masonarySectionType]: { component: SectionMasonary },
          [textblurbSectionType]: { component: SectionTextblurb },
          [heroimgcustomSectionType]: { component: SectionHeroImgCustom },
          [textlinksSectionType]: { component: SectionTextLinks },
          [columnsTextType]: { component: SectionColumnsText },
          [categoriesSectionType]: { component: SectionColumnsCategories },
          [carouselNewSectionType]: { component: SectionCarouselNew },
        },
      }}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
      featuredListings={getFeaturedListingsProps(camelize(ASSET_NAME), props)}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};
  const featuredListingIds = state.LandingPage?.featuredListingIds || [];
  const newListingIds = state.LandingPage?.newListingIds || [];
  const featuredListingObj = featuredListingIds.map(idToSdkUuid);

  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);

  return {
    pageAssetsData,
    listings: getListingsById(state, newListingIds),
    featuredListings: getListingsById(state, featuredListingObj),
    featuredListingIds,
    featuredListingData,
    getListingEntitiesById,
    inProgress,
    error,
  };
};

const mapDispatchToProps = dispatch => ({
  onFetchCustomFeaturedListings: (params, config) =>
    dispatch(landingpageFeaturedListings(params, config)),
  onFetchNewListings: (params, config) => dispatch(searchListings2(params, config)),
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(LandingPageComponent);

export default LandingPage;
