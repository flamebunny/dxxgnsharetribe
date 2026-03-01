import React from 'react';
import loadable from '@loadable/component';


import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { H1 } from '../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, textAccordionSectionId } from './FyiOverviewPage.duck';

import {
  Page,
  LayoutSideNavigationFyi,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import css from './FyiOverviewPage.module.css';

import SectionTextAccordion from '../PageBuilder/SectionBuilder/SectionTextAccordion';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const textAccordionSectionType = 'textaccordion';

const title = 'test';

const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// Presentational component for AboutPage
const FyiOverviewPageComponent = props => {

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

  const fyiNavProps = {
    currentPage: 'FyiOverviewPage',
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
                sectionComponents: {
                  [textAccordionSectionType]: { component: SectionTextAccordion },
                },
              }}
            />          

          </div>
        </LayoutSideNavigationFyi>
      </Page>    
    </>   
  );
};

FyiOverviewPageComponent.propTypes = {
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
const FyiOverviewPage = compose(connect(mapStateToProps))(FyiOverviewPageComponent);

export default FyiOverviewPage;