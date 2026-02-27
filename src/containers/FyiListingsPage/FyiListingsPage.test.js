import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { FyiListingsPageComponent } from './FyiListingsPage';

const { waitFor } = testingLibrary;

describe('FyiListingsPage', () => {
  it('renders the Fallback page on error', async () => {
    const errorMessage = 'FyiListingsPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText } = render(
      <FyiListingsPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    await waitFor(() => {
      expect(getByText('Fyi')).toBeInTheDocument();
      expect(getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
