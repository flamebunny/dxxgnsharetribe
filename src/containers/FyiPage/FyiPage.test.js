import React from 'react';
import '@testing-library/jest-dom';
import { useLocation } from 'react-router-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { FyiPageComponent } from './FyiPage';

const { waitFor } = testingLibrary;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('../TopbarContainer/TopbarContainer', () => () => null);
jest.mock('../FooterContainer/FooterContainer', () => () => null);

const fyiRouteConfiguration = [
  { path: '/fyi', name: 'FyiPage' },
  { path: '/fyilistings', name: 'FyiListingsPage' },
  { path: '/fyiselling', name: 'FyiSellingPage' },
  { path: '/fyibuying', name: 'FyiBuyingPage' },
  { path: '/fyishipping', name: 'FyiShippingPage' },
  { path: '/fyireturns', name: 'FyiReturnsPage' },
];

describe('FyiPage', () => {
  beforeEach(() => {
    useLocation.mockReturnValue({ pathname: '/fyi' });
  });

  it('leaves the browser page title empty when hosted page metadata is missing', async () => {
    render(<FyiPageComponent pageAssetsData={null} inProgress={false} error={null} />, {
      routeConfiguration: fyiRouteConfiguration,
    });

    await waitFor(() => expect(document.title).toBe(''));
  });

  it('uses hosted page meta title as the browser page title', async () => {
    useLocation.mockReturnValue({ pathname: '/fyilistings' });

    render(
      <FyiPageComponent
        pageAssetsData={{
          fyiListings: {
            data: {
              meta: {
                pageTitle: {
                  fieldType: 'metaTitle',
                  content: 'FYI Listings',
                },
              },
              sections: [
                {
                  sectionId: 'fyi-listings',
                  fields: {
                    title: {
                      fieldType: 'heading1',
                      content: 'FYI Listings',
                    },
                  },
                },
              ],
            },
          },
        }}
        inProgress={false}
        error={null}
      />,
      {
        routeConfiguration: fyiRouteConfiguration,
      }
    );

    await waitFor(() => {
      expect(document.title).toBe('FYI Listings');
    });
  });
});
