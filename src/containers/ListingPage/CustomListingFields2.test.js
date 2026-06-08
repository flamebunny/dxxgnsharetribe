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

  it('shows selected multi-enum color values in details', () => {
    render(
      <CustomListingFields2
        heading="Details"
        publicData={{
          listingType: 'sell',
          colorId: ['black', 'white'],
        }}
        metadata={{}}
        categoryConfiguration={{ key: 'categoryLevel', categories: [] }}
        listingFieldConfigs={[
          {
            key: 'colorId',
            schemaType: 'multi-enum',
            enumOptions: [
              { option: 'black', label: 'Black' },
              { option: 'white', label: 'White' },
              { option: 'red', label: 'Red' },
            ],
            scope: 'public',
            showConfig: {
              label: 'Color',
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

    expect(screen.getByText(/Color:/)).toBeInTheDocument();
    expect(screen.getByText('Black, White')).toBeInTheDocument();
  });

  it('shows material subcategories next to their selected material', () => {
    render(
      <CustomListingFields2
        heading="Details"
        publicData={{
          listingType: 'sell',
          materials: ['ceramics', 'metal'],
          materialCeramics: ['boneChina', 'clay'],
          materialMetal: ['brass'],
        }}
        metadata={{}}
        categoryConfiguration={{ key: 'categoryLevel', categories: [] }}
        listingFieldConfigs={[
          {
            key: 'materials',
            schemaType: 'multi-enum',
            enumOptions: [
              { option: 'ceramics', label: 'Ceramics' },
              { option: 'metal', label: 'Metal' },
              { option: 'glass', label: 'Glass' },
            ],
            scope: 'public',
            showConfig: {
              label: 'Materials',
              isDetail: true,
            },
            listingTypeConfig: {
              limitToListingTypeIds: false,
              listingTypeIds: [],
            },
          },
          {
            key: 'materialCeramics',
            schemaType: 'multi-enum',
            enumOptions: [
              { option: 'boneChina', label: 'Bone China' },
              { option: 'clay', label: 'Clay' },
            ],
            scope: 'public',
            showConfig: {
              label: 'Ceramics',
              isDetail: true,
            },
            listingTypeConfig: {
              limitToListingTypeIds: false,
              listingTypeIds: [],
            },
          },
          {
            key: 'materialMetal',
            schemaType: 'multi-enum',
            enumOptions: [{ option: 'brass', label: 'Brass' }],
            scope: 'public',
            showConfig: {
              label: 'Metal',
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

    expect(screen.getByText(/Materials:/)).toBeInTheDocument();
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'SPAN' &&
        node?.textContent === 'Ceramics (Bone China, Clay)Metal (Brass)'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Ceramics:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Metal:/)).not.toBeInTheDocument();
  });

  it('shows limited edition details under edition type', () => {
    render(
      <CustomListingFields2
        heading="Details"
        publicData={{
          listingType: 'sell',
          editionType: 'limited',
          editionOf: 50,
          artistProof: 2,
        }}
        metadata={{}}
        categoryConfiguration={{ key: 'categoryLevel', categories: [] }}
        listingFieldConfigs={[
          {
            key: 'editionType',
            schemaType: 'enum',
            enumOptions: [
              { option: 'oneOfAKind', label: 'One-of-a-kind' },
              { option: 'limited', label: 'Limited Edition' },
            ],
            scope: 'public',
            showConfig: {
              label: 'Edition Type',
              isDetail: true,
            },
            listingTypeConfig: {
              limitToListingTypeIds: false,
              listingTypeIds: [],
            },
          },
          {
            key: 'artistProof',
            schemaType: 'long',
            scope: 'public',
            showConfig: {
              label: "Artist's Proof",
              isDetail: true,
            },
            listingTypeConfig: {
              limitToListingTypeIds: false,
              listingTypeIds: [],
            },
          },
          {
            key: 'editionOf',
            schemaType: 'long',
            scope: 'public',
            showConfig: {
              label: 'Edition of',
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

    expect(screen.getByText(/Edition Type:/)).toBeInTheDocument();
    expect(
      screen.getByText((_, node) =>
        node?.tagName === 'SPAN' &&
        node?.textContent === "Limited EditionArtist's Proof: 2Edition of: 50"
      )
    ).toBeInTheDocument();
  });
});
