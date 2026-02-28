import React from 'react';
import loadable from '@loadable/component';


import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { H1 } from '../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, fyiListingsSectionId } from './FyiListingsPage.duck';

import {
  Page,
  LayoutSideNavigationFyi,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import css from './FyiListingsPage.module.css';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const fyiListingsSectionType = 'fyilistings';

const title = 'test';

const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

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

  // FyiListings Section
    const fyiListingsSectionIdx = pageData?.sections.findIndex(s => s.sectionId === fyiListingsSectionId);
    const fyiListingsSection = pageData?.sections[fyiListingsSectionIdx];
  
    const customfyiListingsSection = {
      ...fyiListingsSection,
      sectionId: fyiListingsSectionId,
      sectionType: fyiListingsSectionType,
    //   listings: listings,
    };

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          if  (idx === fyiListingsSectionIdx) {
              return section;   
          } else {
            return {};
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

  const hasContent = data => typeof data?.content === 'string';
  const exposeContentAsChildren = data => {
    return hasContent(data) ? { children: data.content } : {};
  };
  const CustomHeading1 = props => <H1 as="h2" {...props} />;

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
            
            <SectionBuilder
              {...customPageData}
              options={{
                fieldComponents: {
                  heading1: { component: CustomHeading1, pickValidProps: exposeContentAsChildren },
                },
                isInsideContainer: true,
              }}
            />          

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
  const  { pageAssetsData, inProgress, error} = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error};
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const FyiListingsPage = compose(connect(mapStateToProps))(FyiListingsPageComponent);

export default FyiListingsPage;