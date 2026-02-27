import React from 'react';
import loadable from '@loadable/component';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

// NOTE: You could add the actual Fyi page here as a fallback
//       instead of showing this error message.
const fallbackFyi = `
# An error occurred
The web app couldn\'t reach the backend to fetch the Fyi page.

## Possible actions
Please refresh the page and, if that doesn't help, contact the marketplace administrators.
`;

// Create fallback content (array of sections) in page asset format:
export const fallbackSections = {
  sections: [
    {
      sectionType: 'article',
      sectionId: 'fyi',
      appearance: { fieldType: 'customAppearance', backgroundColor: '#ffffff' },
      title: { fieldType: 'heading1', content: 'Fyi' },
      blocks: [
        {
          blockType: 'defaultBlock',
          blockId: 'hero-content',
          text: {
            fieldType: 'markdown',
            content: fallbackFyi,
          },
        },
      ],
    },
  ],
  meta: {
    pageTitle: {
      fieldType: 'metaTitle',
      content: 'Fyi page',
    },
    pageDescription: {
      fieldType: 'metaDescription',
      content: 'Fyi fetch failed',
    },
  },
};

// This is the fallback page, in case there's no Fyi asset defined in Console.
const FallbackPage = props => {
  return <PageBuilder pageAssetsData={fallbackSections} {...props} />;
};

export default FallbackPage;
