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
import { ASSET_NAME, heroimgcustomSectionId, articlefyiSectionId, articlefyiSection2Id, articlefyiSection3Id, articlefyiSection4Id } from './FyiPage.duck';
import { articleaboutSectionId, articleaboutSection2Id, articleaboutSection3Id, articleaboutSection4Id } from '../AboutPage/AboutPage.duck';

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

import FyiPageOverview from './FyiPageOverview/FyiPageOverview';

import css from './FyiPage.module.css';

import SectionHeroImgCustom from '../PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionArticleAbout from '../PageBuilder/SectionBuilder/SectionArticleAbout';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const heroimgcustomSectionType = 'heroimgcustom';
const articlefyiSectionType = 'articlefyi';
const articlefyiSectionType2 = 'articlefyi2';
const articlefyiSectionType3 = 'articlefyi3';
const articlefyiSectionType4 = 'articlefyi4';

const title = 'test';


const articleaboutSectionType = 'articleabout';
const articleaboutSectionType2 = 'articleabout2';
const articleaboutSectionType3 = 'articleabout3';
const articleaboutSectionType4 = 'articleabout4';



const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// This "content-only" component can be used in modals etc.
const FyiContent2 = props => {
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
    <Page title={title}>
      <LayoutSideNavigationFyi
        sideNavClassName={css.navigation}
        topbar={
          <>
            <TopbarContainer
              mobileRootClassName={css.mobileTopbar}
              desktopClassName={css.desktopTopbar}
            />
            
          </>
        }
        sideNav={
          <>
            <H3 as="h1" className={css.title}>
              <FormattedMessage id="Fyi.title" />
            </H3>
            <TabNav rootClassName={css.tabs} tabRootClassName={css.tab} tabs={tabs} />{' '}
          </>
        }
        footer={<FooterContainer />}
      >       
      
      </LayoutSideNavigationFyi>
    </Page>
  );
};

// This "content-only" component can be used in modals etc.
const FyiContent = props => {
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

// Presentational component for FyiPage
const FyiPageComponent2 = props => {

  const { 
    pageAssetsData, 
    inProgress, 
    error, 
    params,
    scrollingDisabled,
    providerNotificationCount = 0,
  } = props;

  const { tab } = params;

  const isOrders = tab === 'orders';

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // HeroImgCustom Section
  const heroimgcustomSectionIdx = pageData?.sections.findIndex(s => s.sectionId === heroimgcustomSectionId);
  const heroimgcustomSection = pageData?.sections[heroimgcustomSectionIdx];

  const customHeroimgcustomSection = {
    ...heroimgcustomSection,
    sectionId: heroimgcustomSectionId,
    sectionType: heroimgcustomSectionType,
  //   listings: listings,
  };

  // ArticleFyi Section
  const articlefyiSectionIdx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSectionId);
  const articlefyiSection = pageData?.sections[articlefyiSectionIdx];

  const customArticlefyiSection = {
    ...articlefyiSection,
    sectionId: articlefyiSectionId,
    sectionType: articlefyiSectionType,
  //   listings: listings,
  };

    // ArticleFyi2 Section
  const articlefyiSection2Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection2Id);
  const articlefyiSection2 = pageData?.sections[articlefyiSection2Idx];

  const customArticlefyiSection2 = {
    ...articlefyiSection2,
    sectionId: articlefyiSection2Id,
    sectionType: articlefyiSectionType2,
  //   listings: listings,
  };

     // ArticleFyi3 Section
  const articlefyiSection3Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection3Id);
  const articlefyiSection3 = pageData?.sections[articlefyiSection3Idx];

  const customArticlefyiSection3 = {
    ...articlefyiSection3,
    sectionId: articlefyiSection3Id,
    sectionType: articlefyiSectionType3,
  //   listings: listings,
  };

     // ArticleFyi2 Section
  const articlefyiSection4Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection4Id);
  const articlefyiSection4 = pageData?.sections[articlefyiSection4Idx];

  const customArticlefyiSection4 = {
    ...articlefyiSection4,
    sectionId: articlefyiSection4Id,
    sectionType: articlefyiSectionType4,
  //   listings: listings,
  };

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === newSectionIdx ? customNewSection : section,

          if (idx === heroimgcustomSectionIdx) {
            return customHeroimgcustomSection;

          } else if  (idx === articlefyiSectionIdx) {
              return customArticlefyiSection;   

          } else if  (idx === articlefyiSection2Idx) {
              return customArticlefyiSection2;   

          } else if  (idx === articlefyiSection3Idx) {
              return customArticlefyiSection3;  

          } else if  (idx === articlefyiSection4Idx) {
              return customArticlefyiSection4;  

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

  const ordersTabMaybe =   
    [
      {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabTitle" />
        </span>
      ),
      selected: isOrders,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'orders' },
      },
    }
  ];
     

  const salesTabMaybe =
    [
      {
      text: (
        <span>
          <FormattedMessage id="InboxPage.salesTabTitle" />
          {providerNotificationCount > 0 ? (
            <NotificationBadge count={providerNotificationCount} />
          ) : null}
        </span>
      ),
      selected: !isOrders,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'sales' },
      },
    }
  ];
      
  const fyiNavProps = {
    currentPage: 'FyiPage',
  };
  
  const tabs = [...ordersTabMaybe, ...salesTabMaybe];


  const fyiOverfiewInfo = (
    <FyiPageOverview
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

// Presentational component for AboutPage
const FyiPageComponent = props => {

  const { 
    pageAssetsData, 
    inProgress, 
    error, 
    params,
    scrollingDisabled,
    providerNotificationCount = 0,
  } = props;

  const { tab } = params;

  const isOrders = tab === 'orders';

  // Construct custom page data
  const pageData = pageAssetsData?.[camelize(ASSET_NAME)]?.data;

  // HeroImgCustom Section
  const heroimgcustomSectionIdx = pageData?.sections.findIndex(s => s.sectionId === heroimgcustomSectionId);
  const heroimgcustomSection = pageData?.sections[heroimgcustomSectionIdx];

  const customHeroimgcustomSection = {
    ...heroimgcustomSection,
    sectionId: heroimgcustomSectionId,
    sectionType: heroimgcustomSectionType,
  //   listings: listings,
  };

  // ArticleFyi Section
  const articlefyiSectionIdx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSectionId);
  const articlefyiSection = pageData?.sections[articlefyiSectionIdx];

  const customArticlefyiSection = {
    ...articlefyiSection,
    sectionId: articlefyiSectionId,
    sectionType: articlefyiSectionType,
  //   listings: listings,
  };

    // ArticleFyi2 Section
  const articlefyiSection2Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection2Id);
  const articlefyiSection2 = pageData?.sections[articlefyiSection2Idx];

  const customArticlefyiSection2 = {
    ...articlefyiSection2,
    sectionId: articlefyiSection2Id,
    sectionType: articlefyiSectionType2,
  //   listings: listings,
  };

     // ArticleFyi3 Section
  const articlefyiSection3Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection3Id);
  const articlefyiSection3 = pageData?.sections[articlefyiSection3Idx];

  const customArticlefyiSection3 = {
    ...articlefyiSection3,
    sectionId: articlefyiSection3Id,
    sectionType: articlefyiSectionType3,
  //   listings: listings,
  };

     // ArticleFyi2 Section
  const articlefyiSection4Idx = pageData?.sections.findIndex(s => s.sectionId === articlefyiSection4Id);
  const articlefyiSection4 = pageData?.sections[articlefyiSection4Idx];

  const customArticlefyiSection4 = {
    ...articlefyiSection4,
    sectionId: articlefyiSection4Id,
    sectionType: articlefyiSectionType4,
  //   listings: listings,
  };

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === newSectionIdx ? customNewSection : section,

          if (idx === heroimgcustomSectionIdx) {
            return customHeroimgcustomSection;

          } else if  (idx === articleaboutSectionIdx) {
              return customArticleaboutSection;   

          } else if  (idx === articleaboutSection2Idx) {
              return customArticleaboutSection2;   

          } else if  (idx === articleaboutSection3Idx) {
              return customArticleaboutSection3;  

          } else if  (idx === articleaboutSection4Idx) {
              return customArticleaboutSection4;  

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


    const ordersTabMaybe =   
    [
      {
      text: (
        <span>
          <FormattedMessage id="InboxPage.ordersTabTitle" />
        </span>
      ),
      selected: isOrders,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'orders' },
      },
    }
  ];     

  const salesTabMaybe =
    [
      {
      text: (
        <span>
          <FormattedMessage id="InboxPage.salesTabTitle" />
          {providerNotificationCount > 0 ? (
            <NotificationBadge count={providerNotificationCount} />
          ) : null}
        </span>
      ),
      selected: !isOrders,
      linkProps: {
        name: 'InboxPage',
        params: { tab: 'sales' },
      },
    }
  ];
      
  const fyiNavProps = {
    currentPage: 'FyiPage',
  };
  
  const tabs = [...ordersTabMaybe, ...salesTabMaybe];


  const fyiOverfiewInfo = (
    <FyiPageOverview
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
    <PageBuilder
      pageAssetsData={customPageData}
      options={{
        sectionComponents: {       
          [heroimgcustomSectionType]: { component: SectionHeroImgCustom },
          [articleaboutSectionType]: { component: SectionArticleAbout }, 
          [articleaboutSectionType2]: { component: SectionArticleAbout }, 
          [articleaboutSectionType3]: { component: SectionArticleAbout }, 
          [articleaboutSectionType4]: { component: SectionArticleAbout }, 
        },
      }}
      inProgress={inProgress}
      error={error}
      fallbackPage={<FallbackPage />}
    />
    </>   
  );
};


FyiPageComponent.propTypes = {
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
const FyiPage = compose(connect(mapStateToProps))(FyiPageComponent);

const FYI_ASSET_NAME = ASSET_NAME;
export { FYI_ASSET_NAME, FyiPageComponent, FyiContent };

export default FyiPage;
