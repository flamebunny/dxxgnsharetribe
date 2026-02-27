import React from 'react';
import loadable from '@loadable/component';


import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { FormattedMessage, intlShape, useIntl } from '../../util/reactIntl';

import { H1 } from '../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, fyiListingsSectionId } from './FyiListingsPage.duck';

import {
  H2,
  H3,
  Avatar,
  NamedLink,
  NotificationBadge,
  Page,
  PaginationLinks,
  TabNav,
  IconSpinner,
  TimeRange,
  UserDisplayName,
  UserNav,
  LayoutSideNavigation,
  LayoutSideNavigationFyi,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import FyiListingsPageOverview from './FyiListingsPageOverview/FyiListingsPageOverview';

import css from './FyiListingsPage.module.css';

import SectionArticleAbout from '../PageBuilder/SectionBuilder/SectionArticleAbout';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const title = 'test';

const fyiListingsSectionType = 'articleabout';


const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// This "content-only" component can be used in modals etc.
const FyiListingsContent = props => {
  const { inProgress, error, data } = props;  

  if (inProgress) {
    return null;
  }

  // We don't want to add h1 heading twice to the HTML (SEO issue).
  // Modal's header is mapped as h2
  const hasContent = data => typeof data?.content === 'string';
  const exposeContentAsChildren = data => {
    return hasContent(data) ? { children: data.content } : {};
  };
  const CustomHeading1 = props => <H1 as="h2" {...props} />;

  const hasData = error === null && data;
  const sectionsData = hasData ? data : fallbackSections;

  return (
    <SectionBuilder
      {...sectionsData}
      options={{
        fieldComponents: {
          heading1: { component: CustomHeading1, pickValidProps: exposeContentAsChildren },
        },
        isInsideContainer: true,
      }}
    />
  );
};

// Presentational component for AboutPage
const FyiListingsPageComponent = props => {

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

  return (
    <>
    <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSideNavigationFyi
          topbar={
            <>
              <TopbarContainer
                desktopClassName={css.desktopTopbar}
                mobileClassName={css.mobileTopbar}
              />
             
            </>
          }
          sideNav={null}
          useAccountSettingsNav
          accountSettingsNavProps={fyiNavProps}
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            <H3 as="h1">
              <FormattedMessage id="ContactDetailsPage.heading" />
            </H3>
            {fyiOverfiewInfo}
          </div>
        </LayoutSideNavigationFyi>
      </Page>    
    </>   
  );
};

FyiListingsPageComponent.propTypes = {
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
const FyiListingsPage = compose(connect(mapStateToProps))(FyiListingsPageComponent);

const FYI_ASSET_NAME = ASSET_NAME;
export { FYI_ASSET_NAME, FyiListingsPageComponent, FyiListingsContent };

export default FyiListingsPage;
