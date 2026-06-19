import React from 'react';
import '@testing-library/jest-dom';

import { fakeIntl } from '../../../../util/testData';
import { renderWithProviders as render, testingLibrary } from '../../../../util/testHelpers';

import EditListingPricingAndStockForm from './EditListingPricingAndStockForm';

const { screen, userEvent, waitFor } = testingLibrary;

const noop = () => null;

describe('EditListingDeliveryForm', () => {
  it('Check that price can be given and submit button activates', async () => {
    const user = userEvent.setup();
    const saveActionMsg = 'Save price';
    render(
      <EditListingPricingAndStockForm
        intl={fakeIntl}
        dispatch={noop}
        onSubmit={v => v}
        marketplaceCurrency="USD"
        listingMinimumPriceSubUnits={0}
        unitType="item"
        listingType={{ listingType: 'sell-bikes', stockType: 'multipleItems' }}
        saveActionMsg={saveActionMsg}
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
      />
    );

    // Test that save button is disabled at first
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeDisabled();

    // Fill mandatory attributes
    const price = 'EditListingPricingAndStockForm.pricePerProduct';
    await user.type(screen.getByRole('textbox', { name: price }), '10');
    const stock = 'EditListingPricingAndStockForm.stockLabel';
    await user.type(screen.getByRole('spinbutton', { name: stock }), '10');

    // Test that save button is enabled
    expect(screen.getByRole('button', { name: saveActionMsg })).toBeEnabled();
  });

  it('calculates buyer pays from price plus buyer commission', async () => {
    const user = userEvent.setup();
    render(
      <EditListingPricingAndStockForm
        intl={fakeIntl}
        dispatch={noop}
        onSubmit={v => v}
        marketplaceCurrency="USD"
        listingMinimumPriceSubUnits={0}
        unitType="item"
        listingType={{ listingType: 'sell-bikes', stockType: 'multipleItems' }}
        saveActionMsg="Save price"
        updated={false}
        updateInProgress={false}
        disabled={false}
        ready={false}
      />,
      {
        initialState: {
          hostedAssets: {
            pageAssetsData: {
              commission: {
                data: {
                  providerCommission: { percentage: 20, minimum_amount: 0 },
                  customerCommission: { percentage: 10, minimum_amount: 0 },
                },
              },
            },
          },
        },
        messages: {
          'EditListingPricingAndStockForm.priceEarning': 'Sale proceeds',
          'EditListingPricingAndStockForm.priceBuyerFee': 'Buyer pays',
        },
      }
    );

    await user.type(
      screen.getByRole('textbox', {
        name: 'EditListingPricingAndStockForm.pricePerProduct',
      }),
      '100'
    );

    const sellerProceeds = screen.getByText('Sale proceeds').closest('label').nextElementSibling;
    const buyerPays = screen.getByText('Buyer pays').closest('label').nextElementSibling;

    await waitFor(() => {
      expect(sellerProceeds).toHaveTextContent('$80.00');
      expect(buyerPays).toHaveTextContent('$110.00');
    });
  });
});
