import React from 'react';
import loadable from '@loadable/component';
import { useLocation } from 'react-router-dom';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { H1 } from '../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, heroimgcustomSectionId, articleaboutSectionId, articleaboutSection2Id, articleaboutSection3Id, articleaboutSection4Id } from './AboutPage.duck';

import SectionHeroImgCustom from '../../containers/PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionArticleAbout from '../PageBuilder/SectionBuilder/SectionArticleAbout';

import {
  LayoutSideNavigationFyi,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

import css from './AboutPage.module.css';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const heroimgcustomSectionType = 'heroimgcustom';
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
const AboutContent = props => {
  const { 
    pageAssetsData, 
    inProgress, 
    error, 
    data,
    params,
    providerNotificationCount = 0,
  } = props;

  if (inProgress) {
    return null;
  }

  const location = useLocation();

  const pageMap = {
    '/about': 'AboutPage',
    '/aboutquestionnaire': 'AboutQuestionnairePage',
  };

  const assetPageMap = {
    '/about': 'aboutOverview',
    '/aboutquestionnaire': 'aboutQuestionnaire',
  };  

  const aboutNavProps = {
    currentPage: pageMap[`${location.pathname}`] || '',
  };
  
  const assetName = assetPageMap[`${location.pathname}`];

  // Construct custom page data
  const pageData = pageAssetsData?.[assetName]?.data;
  const pageMetaProps = getMetadata(pageData);

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
          accountSettingsNavProps={aboutNavProps}
          footer={<FooterContainer />}
        >
          <div className={css.content}>
            
            <SectionBuilder
              {...sectionsData}
              options={{
                fieldComponents: {
                  heading1: { component: CustomHeading1, pickValidProps: exposeContentAsChildren },
                },
                isInsideContainer: true,
              }}
            /> 

          </div>
        </LayoutSideNavigationFyi>
      </StaticPage>    
    </>   
  );

};

// Presentational component for AboutPage
const AboutPageComponent = props => {

  const { pageAssetsData, inProgress, error } = props;

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

  // ArticleAbout Section
  const articleaboutSectionIdx = pageData?.sections.findIndex(s => s.sectionId === articleaboutSectionId);
  const articleaboutSection = pageData?.sections[articleaboutSectionIdx];

  const customArticleaboutSection = {
    ...articleaboutSection,
    sectionId: articleaboutSectionId,
    sectionType: articleaboutSectionType,
  //   listings: listings,
  };

    // ArticleAbout2 Section
  const articleaboutSection2Idx = pageData?.sections.findIndex(s => s.sectionId === articleaboutSection2Id);
  const articleaboutSection2 = pageData?.sections[articleaboutSection2Idx];

  const customArticleaboutSection2 = {
    ...articleaboutSection2,
    sectionId: articleaboutSection2Id,
    sectionType: articleaboutSectionType2,
  //   listings: listings,
  };

     // ArticleAbout3 Section
  const articleaboutSection3Idx = pageData?.sections.findIndex(s => s.sectionId === articleaboutSection3Id);
  const articleaboutSection3 = pageData?.sections[articleaboutSection3Idx];

  const customArticleaboutSection3 = {
    ...articleaboutSection3,
    sectionId: articleaboutSection3Id,
    sectionType: articleaboutSectionType3,
  //   listings: listings,
  };

     // ArticleAbout2 Section
  const articleaboutSection4Idx = pageData?.sections.findIndex(s => s.sectionId === articleaboutSection4Id);
  const articleaboutSection4 = pageData?.sections[articleaboutSection4Idx];

  const customArticleaboutSection4 = {
    ...articleaboutSection4,
    sectionId: articleaboutSection4Id,
    sectionType: articleaboutSectionType4,
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

  return (
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
  );
};

AboutPageComponent.propTypes = {
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
const AboutPage = compose(connect(mapStateToProps))(AboutPageComponent);

const ABOUT_ASSET_NAME = ASSET_NAME;
export { ABOUT_ASSET_NAME, AboutPageComponent, AboutContent };

export default AboutPage;
