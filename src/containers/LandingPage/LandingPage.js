import React, { useEffect } from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME, getRecommendedListingParams, recommendedSectionId, masonarySectionId, textblurbSectionId, heroimgcustomSectionId, textlinksSectionId, columnsTextSectionId } from './LandingPage.duck';
import { getListingsById } from '../../ducks/marketplaceData.duck';
import SectionMasonary from '../../containers/PageBuilder/SectionBuilder/SectionMasonary';
import SectionTextblurb from '../../containers/PageBuilder/SectionBuilder/SectionTextblurb';
import SectionHeroImgCustom from '../../containers/PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionTextLinks from '../../containers/PageBuilder/SectionBuilder/SectionTextLinks';
import SectionColumnsText from '../../containers/PageBuilder/SectionBuilder/SectionColumnsText';

import { manageDisableScrolling, isScrollingDisabled } from '../../ducks/ui.duck';



import { searchListings } from '../SearchPage/SearchPage.duck';
import { useConfiguration } from '../../context/configurationContext';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

import { SectionRecommendedListings } from '../PageBuilder/SectionBuilder';

const recommendedSectionType = 'recommended';
const textblurbSectionType = 'textblurb';
const heroimgcustomSectionType = 'heroimgcustom';
const masonarySectionType = 'masonary';
const textlinksSectionType = 'textlinks';
const columns = 'columns';
const userSectionType = 'user';
const columnsTextType = 'columnstext';

export const LandingPageComponent = props => {
  const {
    pageAssetsData,
    listings,
    inProgress,
    error,
    currentUser,
    recommendedListingIds,
    onFetchRecommendedListings,
  } = props;

  const config = useConfiguration();
  useEffect(() => {
    //const params = getRecommendedListingParams(config, recommendedListingIds);
    //onFetchRecommendedListings(params, config);
  }, [recommendedListingIds]);

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // Recommended Listing Section
  const recommendedSectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === recommendedSectionId
  );
  const recommendedSection = pageData?.sections[recommendedSectionIdx];

  const customRecommendedSection = {
    ...recommendedSection,
    sectionId: recommendedSectionId,
    sectionType: recommendedSectionType,
    listings: listings,
  };

  // Masonary Section
  const masonarySectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === masonarySectionId
  );
  const masonarySection = pageData?.sections[masonarySectionIdx];

  const customMasonarySection = {
    ...masonarySection,
    sectionId: masonarySectionId,
    sectionType: masonarySectionType,
    listings: listings,
  };

  // Textblurb Section
  const textblurbSectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === textblurbSectionId
  );
  const textblurbSection = pageData?.sections[textblurbSectionIdx];

  const customTextblurbSection = {
    ...textblurbSection,
    sectionId: textblurbSectionId,
    sectionType: textblurbSectionType,
    listings: listings,
  };

  // HeroImgCustom Section
  const heroimgcustomSectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === heroimgcustomSectionId
  );
  const heroimgcustomSection = pageData?.sections[heroimgcustomSectionIdx];

  const customHeroimgcustomSection = {
    ...heroimgcustomSection,
    sectionId: heroimgcustomSectionId,
    sectionType: heroimgcustomSectionType,
    listings: listings,
  };

    // TextLinks Section
    const textlinksSectionIdx = pageData?.sections.findIndex(
      s => s.sectionId === textlinksSectionId
    );
    const textlinksSection = pageData?.sections[textlinksSectionIdx];
  
    const customTextlinksSection = {
      ...textlinksSection,
      sectionId: textlinksSectionId,
      sectionType: textlinksSectionType,
      listings: listings,
    };

    // ColumnsText Section
  const columnsTextSectionIdx = pageData?.sections.findIndex(
    s => s.sectionId === columnsTextSectionId
  );
  const columnsText = pageData?.sections[columnsTextSectionIdx];

  const customColumnsTextSection = {
    ...columnsText,
    sectionId: columnsTextSectionId,
    sectionType: columnsTextType,
    listings: listings,
  };
    

  // Current user Section
  const customCurrentUserSection = {
    sectionType: userSectionType,
    currentUser,
  };

  const customSections = pageData
    ? [
        customCurrentUserSection,
        ,
        ...pageData?.sections?.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === recommendedSectionIdx ? customRecommendedSection : section,


          if (idx === masonarySectionIdx) {
            return customMasonarySection;
          } else if (idx === recommendedSectionIdx) {
            return customRecommendedSection;
          } else if (idx === textblurbSectionIdx) {
            return customTextblurbSection;
          } else if (idx === heroimgcustomSectionIdx) {
            return customHeroimgcustomSection;
          } else if (idx === textlinksSectionIdx) {
            return customTextlinksSection;
          } else if (idx === columnsTextSectionIdx) {
            return customColumnsTextSection;

            
          } else {
            return section;
          }
          
        }),
      ]
    : null;

  const customPageData = pageData
    ? {
        ...pageData,
        sections: customSections,
      }
    : pageData;

  console.log(customPageData);


  return (

    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {
          [recommendedSectionType]: { component: SectionRecommendedListings },
          [masonarySectionType]: { component: SectionMasonary },
          [textblurbSectionType]: { component: SectionTextblurb },
          [heroimgcustomSectionType]: { component: SectionHeroImgCustom },     
          [textlinksSectionType]: { component: SectionTextLinks },     
          [columnsTextType]: { component: SectionColumnsText },     
               
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

const mapStateToProps2 = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const { recommendedListingIds } = state.LandingPage;
  const { currentPageResultIds } = state.SearchPage;
  const { currentUser } = state.user;
  const listings = getListingsById(state, currentPageResultIds);
  return { pageAssetsData, listings, inProgress, error, currentUser, recommendedListingIds };
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const {
    currentPageResultIds,
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
  } = state.SearchPage;
  const listings = getListingsById(state, currentPageResultIds);

  return {
    pageAssetsData,
    listings,
    inProgress,
    error,
    currentUser,
    pagination,
    scrollingDisabled: isScrollingDisabled(state),
    searchInProgress,
    searchListingsError,
    searchParams,
  };
};

const mapDispatchToProps2 = dispatch => ({
  onFetchRecommendedListings: (params, config) => dispatch(searchListings(params, config)),
});

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
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