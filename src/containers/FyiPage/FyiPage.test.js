import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import { FyiPageComponent } from './FyiPage';

const { waitFor } = testingLibrary;

describe('FyiPage', () => {
  it('renders the Fallback page on error', async () => {
    const errorMessage = 'FyiPage failed';
    let e = new Error(errorMessage);
    e.type = 'error';
    e.name = 'Test';

    const { getByText } = render(
      <FyiPageComponent pageAssetsData={null} inProgress={false} error={e} />
    );

    await waitFor(() => {
      expect(getByText('Fyi')).toBeInTheDocument();
      expect(getByText('An error occurred')).toBeInTheDocument();
    });
  });
});
