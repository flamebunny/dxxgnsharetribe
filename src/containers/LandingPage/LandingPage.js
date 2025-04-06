import React, { useEffect } from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME, getNewListingParams, getFashionListingParams, getFeaturedListingParams, featuredSectionId, newSectionId, fashionSectionId, masonarySectionId, textblurbSectionId, heroimgcustomSectionId, textlinksSectionId, columnsTextSectionId, categoriesSectionId } from './LandingPage.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import SectionMasonary from '../../containers/PageBuilder/SectionBuilder/SectionMasonary';
import SectionTextblurb from '../../containers/PageBuilder/SectionBuilder/SectionTextblurb';
import SectionHeroImgCustom from '../../containers/PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionTextLinks from '../../containers/PageBuilder/SectionBuilder/SectionTextLinks';
import SectionColumnsText from '../../containers/PageBuilder/SectionBuilder/SectionColumnsText';
import SectionNewListings from '../../containers/PageBuilder/SectionBuilder/SectionNewListings';
import SectionFeaturedListings from '../../containers/PageBuilder/SectionBuilder/SectionFeaturedListings';
import SectionColumnsCategories from '../PageBuilder/SectionBuilder/SectionColumnsCategories';

import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';

import { searchListings } from '../SearchPage/SearchPage.duck';
import { landingpageFeaturedListings } from '../LandingPage/LandingPage.duck';
import { useConfiguration } from '../../context/configurationContext';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const newSectionType = 'new';
const fashionSectionType = 'fashion';
const featuredSectionType = 'featured';
const textblurbSectionType = 'textblurb';
const heroimgcustomSectionType = 'heroimgcustom';
const masonarySectionType = 'masonary';
const textlinksSectionType = 'textlinks';
const columns = 'columns';
const userSectionType = 'user';
const columnsTextType = 'columnstext';
const categoriesSectionType = 'categories';

export const LandingPageComponent = props => {
  const {
    pageAssetsData,
    listings,
    fashionListings,
    featuredListings,
    inProgress,
    error,
    currentUser,
    newListingIds,
    featuredListingIds,
    onFetchNewListings,
    onFetchCategoryFashionListings,
    onFetchFeaturedListings,
  } = props;

  const config = useConfiguration();  

  useEffect(() => {
    const paramsFeatured = getFeaturedListingParams(config, featuredListingIds);
    const paramsNew = getNewListingParams(config);
    const paramsFashion = getFashionListingParams(config);
    onFetchFeaturedListings(paramsFeatured, config);
    onFetchNewListings(paramsNew, config);
  //  onFetchCategoryFashionListings(paramsFashion, config);
      
  }, [featuredListingIds]);

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // Construct custom page data
  // Featured Listing Section
  const featuredSectionIdx = pageData?.sections.findIndex(s => s.sectionId === featuredSectionId);
  const featuredSection = pageData?.sections[featuredSectionIdx];

  // Define the necessary props for the custom section
  const customFeaturedSection = {
    ...featuredSection,
    sectionId: featuredSectionId,
    sectionType: featuredSectionType,
    listings: featuredListings,
  };   

  // New Listing Section
  const newSectionIdx = pageData?.sections.findIndex(s => s.sectionId === newSectionId);
  const newSection = pageData?.sections[newSectionIdx];

  const customNewSection = {
    ...newSection,
    sectionId: newSectionId,
    sectionType: newSectionType,
    listings: listings,
  };

  // Fashion Listing Section
  const fashionSectionIdx = pageData?.sections.findIndex(s => s.sectionId === fashionSectionId);
  const fashionSection = pageData?.sections[fashionSectionIdx];

  const customFashionSection = {
    ...fashionSection,
    sectionId: fashionSectionId,
    sectionType: fashionSectionType,
    listings: listings,
  };

  // Masonary Section
  const masonarySectionIdx = pageData?.sections.findIndex(s => s.sectionId === masonarySectionId);
  const masonarySection = pageData?.sections[masonarySectionIdx];

  const customMasonarySection = {
    ...masonarySection,
    sectionId: masonarySectionId,
    sectionType: masonarySectionType,
//    listings: listings,
  };

  // Textblurb Section
  const textblurbSectionIdx = pageData?.sections.findIndex(s => s.sectionId === textblurbSectionId);
  const textblurbSection = pageData?.sections[textblurbSectionIdx];

  const customTextblurbSection = {
    ...textblurbSection,
    sectionId: textblurbSectionId,
    sectionType: textblurbSectionType,
 //   listings: listings,
  };

  // HeroImgCustom Section
  const heroimgcustomSectionIdx = pageData?.sections.findIndex(s => s.sectionId === heroimgcustomSectionId);
  const heroimgcustomSection = pageData?.sections[heroimgcustomSectionIdx];

  const customHeroimgcustomSection = {
    ...heroimgcustomSection,
    sectionId: heroimgcustomSectionId,
    sectionType: heroimgcustomSectionType,
 //   listings: listings,
  };

    // TextLinks Section
    const textlinksSectionIdx = pageData?.sections.findIndex(s => s.sectionId === textlinksSectionId);
    const textlinksSection = pageData?.sections[textlinksSectionIdx];
  
    const customTextlinksSection = {
      ...textlinksSection,
      sectionId: textlinksSectionId,
      sectionType: textlinksSectionType,
  //    listings: listings,
    };

    // ColumnsText Section
  const columnsTextSectionIdx = pageData?.sections.findIndex(s => s.sectionId === columnsTextSectionId);
  const columnsText = pageData?.sections[columnsTextSectionIdx];

  const customColumnsTextSection = {
    ...columnsText,
    sectionId: columnsTextSectionId,
    sectionType: columnsTextType,
 //   listings: listings,
  };

  // LandingPage Categories Section
  const categoriesSectionIdx = pageData?.sections.findIndex(s => s.sectionId === categoriesSectionId);
  const categoriesSection = pageData?.sections[categoriesSectionIdx];

  const customCategoriesSection = {
    ...categoriesSection,
    sectionId: categoriesSectionId,
    sectionType: categoriesSectionType,
    allCategories: config.categoryConfiguration.categories,
  //  listings: listings,
  };
    
  // Replace the original section with the custom section object
  // in custom page data

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === newSectionIdx ? customNewSection : section,
    
          if (idx === masonarySectionIdx) {
            return customMasonarySection;

          } else if (idx === newSectionIdx) {
            return customNewSection;

          } else if (idx === fashionSectionIdx) {
            return customFashionSection;

          } else if (idx === featuredSectionIdx) {
            return customFeaturedSection;

          } else if (idx === textblurbSectionIdx) {
            return customTextblurbSection;

          } else if (idx === heroimgcustomSectionIdx) {
            return customHeroimgcustomSection;

          } else if (idx === textlinksSectionIdx) {
            return customTextlinksSection;
            
          } else if (idx === columnsTextSectionIdx) {
            return customColumnsTextSection;

          } else if (idx === categoriesSectionIdx) {
            return customCategoriesSection;
            
          } else {
            return section;
          }
          
        }),
      ]
    : null;

  // console.log('LandingPage CustomSections')
  // console.log(customSections)

  const customPageData = pageData
    ? {
        ...pageData,
        sections: customSections,
      }
    : pageData;

  return (

    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {
          [newSectionType]: { component: SectionNewListings },
       //   [fashionSectionType]: { component: SectionNewListings },
          [featuredSectionType]: { component: SectionFeaturedListings },
        //  [masonarySectionType]: { component: SectionMasonary },
          [textblurbSectionType]: { component: SectionTextblurb },
          [heroimgcustomSectionType]: { component: SectionHeroImgCustom },     
          [textlinksSectionType]: { component: SectionTextLinks },     
          [columnsTextType]: { component: SectionColumnsText },     
          [categoriesSectionType]: { component: SectionColumnsCategories },     
               
        },
      }}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage error={error} />}
    />
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};  
  const { featuredListingIds } = state.LandingPage;
  const { currentPageResultIds ,  pagination,  searchInProgress,  searchListingsError,  searchParams } = state.SearchPage;
  const newCurrentPageResultIds = currentPageResultIds;
  const newPagination = pagination;
  const newSearchInProgress = searchInProgress;
  const newSearchListingsError = searchListingsError;
  const newSearchParams = searchParams;

  const t = (uuid) => ({
    uuid,
    _sdkType: "UUID"
  });
     
  const featuredListingObj = featuredListingIds.map(t);
  const featuredListings = getListingsById(state, featuredListingObj);
  const listings = getListingsById(state, newCurrentPageResultIds);
  
  return {
    pageAssetsData,
    listings,
    featuredListings,
    inProgress,
    error,
    featuredListingIds,
    currentUser,    
    scrollingDisabled: isScrollingDisabled(state),
    newPagination,
    newSearchInProgress,
    newSearchListingsError,
    newSearchParams,
  };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) => dispatch(manageDisableScrolling(componentId, disableScrolling)),

  onFetchFeaturedListings: (params, config) => dispatch(landingpageFeaturedListings(params, config)),

  onFetchNewListings: (params, config) => dispatch(searchListings(params, config)),
  onFetchCategoryFashionListings: (params, config) => dispatch(searchListings(params, config)),

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