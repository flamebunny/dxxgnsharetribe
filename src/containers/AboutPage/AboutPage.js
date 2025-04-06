import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import { H1 } from '../PageBuilder/Primitives/Heading';
import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME, heroimgcustomSectionId, articleaboutSectionId } from './AboutPage.duck';

import SectionHeroImgCustom from '../../containers/PageBuilder/SectionBuilder/SectionHeroImgCustom';
import SectionArticleAbout from '../PageBuilder/SectionBuilder/SectionArticleAbout';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

const heroimgcustomSectionType = 'heroimgcustom';
const articleaboutSectionType = 'articleabout';



const SectionBuilder = loadable(
  () => import(/* webpackChunkName: "SectionBuilder" */ '../PageBuilder/PageBuilder'),
  {
    resolveComponent: components => components.SectionBuilder,
  }
);

// This "content-only" component can be used in modals etc.
const AboutContent = props => {
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

  const customSections = pageData
    ? [
        ...pageData.sections.map((section, idx) =>{
          //idx === masonarySectionIdx ? customMasonarySection : section,
          //idx === newSectionIdx ? customNewSection : section,

          if (idx === heroimgcustomSectionIdx) {
            return customHeroimgcustomSection;

          } else if  (idx === articleaboutSectionIdx) {
              return customArticleaboutSection;   

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
