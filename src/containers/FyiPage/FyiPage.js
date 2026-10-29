import React from 'react';
import loadable from '@loadable/component';
import { useLocation } from 'react-router-dom';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { H1 } from '../PageBuilder/Primitives/Heading';
import StaticPage from '../PageBuilder/StaticPage';
import { validProps } from '../PageBuilder/Field';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, textAccordionSectionId } from './FyiPage.duck';

import {
  LayoutSideNavigationFyi,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import css from './FyiPage.module.css';

import SectionTextAccordion from '../PageBuilder/SectionBuilder/SectionTextAccordion';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const textAccordionSectionType = 'textaccordion';

const getMetadata = pageData => {
  const meta = pageData?.meta || {};
  const { pageTitle, pageDescription, socialSharing } = meta;
  const title = validProps(pageTitle)?.content;
  const description = validProps(pageDescription)?.content;
  const openGraph = validProps(socialSharing);

  return {
    title,
    description,
    schema: {
      '@context': 'http://schema.org',
      '@type': 'WebPage',
      description,
      name: title,
    },
    socialSharing: openGraph,
  };
};

const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// Presentational component for FyiPage
const FyiPageComponent = props => {

  const { 
    pageAssetsData, 
    inProgress, 
    error, 
    params,
    providerNotificationCount = 0,
  } = props;

  //
  
  const location = useLocation();

  const pageMap = {
    '/fyi': 'FyiPage',
    '/fyilistings': 'FyiListingsPage',
    '/fyiselling': 'FyiSellingPage',
    '/fyibuying': 'FyiBuyingPage',
    '/fyishipping': 'FyiShippingPage',
    '/fyireturns': 'FyiReturnsPage',
  };

  const assetPageMap = {
    '/fyi': 'fyiOverview',
    '/fyilistings': 'fyiListings',
    '/fyiselling': 'fyiSelling',
    '/fyibuying': 'fyiBuying',
    '/fyishipping': 'fyiShipping',
    '/fyireturns': 'fyiReturns',
  };

  const fyiNavProps = {
    currentPage: pageMap[`${location.pathname}`] || '',
  };
  
  const assetName = assetPageMap[`${location.pathname}`];

  // Construct custom page data
  const pageData = pageAssetsData?.[assetName]?.data;
  const pageMetaProps = getMetadata(pageData);

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          
            return {
              ...section,
              sectionType: textAccordionSectionType
            };
                   
        }),
      ]
    : null;

  const customPageData = pageData
    ? {
        ...pageData,
        sections: customSections,
      }
    : pageData;

  const hasContent = data => typeof data?.content === 'string';
  const exposeContentAsChildren = data => {
    return hasContent(data) ? { children: data.content } : {};
  };
  const CustomHeading1 = props => <H1 as="h2" {...props} />;

  return (
    <>
    <StaticPage {...pageMetaProps}>
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
                sectionComponents: {
                  [textAccordionSectionType]: { component: SectionTextAccordion },
                },
              }}
            />          

          </div>
        </LayoutSideNavigationFyi>
      </StaticPage>    
    </>   
  );
};

FyiPageComponent.propTypes = {
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
const FyiPage = compose(connect(mapStateToProps))(FyiPageComponent);

const FYI_ASSET_NAME = ASSET_NAME;
export { FYI_ASSET_NAME, FyiPageComponent };

export default FyiPage;
