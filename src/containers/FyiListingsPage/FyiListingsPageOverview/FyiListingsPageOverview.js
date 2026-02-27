import React, { Component } from 'react';
import loadable from '@loadable/component';
import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../../util/string';
import { propTypes } from '../../../util/types';

import { FormattedMessage, intlShape, useIntl } from '../../../util/reactIntl';

import { H1 } from '../../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from '../FallbackPage';
import { ASSET_NAME, fyiListingsSectionId } from '../FyiListingsPage.duck';

import css from '../FyiListingsPage.module.css';
import SectionArticleAbout from '../../PageBuilder/SectionBuilder/SectionArticleAbout';


const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../../PageBuilder/PageBuilder')
);

const title = 'test';



const fyiListingsSectionType = 'articleabout';



class FyiListingsPageOverviewComponent2 extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
        <div>
            Test Listings Overview
        </div>
        );
    }

}


// Presentational component for AboutPage
const FyiListingsPageOverviewComponent = props => {

  const { 
    pageAssetsData, 
    inProgress, 
    error, 
    params,
    scrollingDisabled,
    providerNotificationCount = 0,
  } = props;

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // ArticleFyi Section
  const fyiListingsSectionIdx = pageData?.sections.findIndex(s => s.sectionId === fyiListingsSectionId);
  const fyiListingsSection = pageData?.sections[fyiListingsSectionIdx];

  const customArticlefyiSection = {
    ...fyiListingsSection,
    sectionId: fyiListingsSectionId,
    sectionType: fyiListingsSectionType,
  //   listings: listings,
  };


  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === newSectionIdx ? customNewSection : section,

          if (idx === fyiListingsSectionIdx) {
            return customArticlefyiSection;

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
   
      
  const fyiNavProps = {
    currentPage: 'FyiListingsPage',
  };

  const fyiOverfiewInfo = (
    <FyiListingsPageOverview
      className={css.form}      
    />
  );


  console.log(customPageData);

  return (
    <>   
    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {       
          [fyiListingsSectionType]: { component: SectionArticleAbout },       
        },
      }}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage />}
    />
    </>   
  );
};


FyiListingsPageOverviewComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const FyiListingsPageOverview = compose(connect(mapStateToProps))(FyiListingsPageOverviewComponent);

export default FyiListingsPageOverview;