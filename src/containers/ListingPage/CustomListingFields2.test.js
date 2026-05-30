import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';

import CustomListingFields2 from './CustomListingFields2';

const { screen } = testingLibrary;

describe('CustomListingFields2', () => {
  it('shows dynamically generated design year values', () => {
    render(
      <CustomListingFields2
        heading="Details"
        publicData={{
          listingType: 'sell',
          designYear: `${new Date(Date.now()).getFullYear()}`,
        }}
        metadata={{}}
        categoryConfiguration={{ key: 'categoryLevel', categories: [] }}
        listingFieldConfigs={[
          {
            key: 'designYear',
            schemaType: 'enum',
            enumOptions: [{ option: '2010', label: '2010' }],
            scope: 'public',
            showConfig: {
              label: 'Design year',
              isDetail: true,
            },
            listingTypeConfig: {
              limitToListingTypeIds: false,
              listingTypeIds: [],
            },
          },
        ]}
      />
    );

    const currentYear = `${new Date(Date.now()).getFullYear()}`;

    expect(screen.getByText(/Design year:/)).toBeInTheDocument();
    expect(screen.getByText(currentYear)).toBeInTheDocument();
  });
});
