import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { AboutPageComponent } from './AboutPage';

const { waitFor } = testingLibrary;

describe('AboutPage', () => {
  it('renders the Fallback page on error', async () => {
    const errorMessage = 'AboutPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText } = render(
      <AboutPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    await waitFor(() => {
      expect(getByText('About')).toBeInTheDocument();
      expect(getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
