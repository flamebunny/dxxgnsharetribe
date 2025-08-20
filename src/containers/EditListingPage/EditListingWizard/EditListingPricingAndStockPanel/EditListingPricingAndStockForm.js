import React, { useState } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage } from '../../../../util/reactIntl';
import { STOCK_INFINITE_ITEMS, STOCK_MULTIPLE_ITEMS, propTypes } from '../../../../util/types';
import { isOldTotalMismatchStockError } from '../../../../util/errors';
import * as validators from '../../../../util/validators';
import { formatMoney } from '../../../../util/currency';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import * as log from '../../../../util/log';

// Import shared components
import {
  Button,
  Form,
  FieldCurrencyInput,
  FieldCheckboxGroup,
  FieldTextInput,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingPricingAndStockForm.module.css';

const { Money } = sdkTypes;
const MILLION = 1000000;

const getPriceValidators = (listingMinimumPriceSubUnits, marketplaceCurrency, intl) => {
  const priceRequiredMsgId = { id: 'EditListingPricingAndStockForm.priceRequired' };
  const priceRequiredMsg = intl.formatMessage(priceRequiredMsgId);
  const priceRequired = validators.required(priceRequiredMsg);

  const minPriceRaw = new Money(listingMinimumPriceSubUnits, marketplaceCurrency);
  const minPrice = formatMoney(intl, minPriceRaw);
  const priceTooLowMsgId = { id: 'EditListingPricingAndStockForm.priceTooLow' };
  const priceTooLowMsg = intl.formatMessage(priceTooLowMsgId, { minPrice });
  const minPriceRequired = validators.moneySubUnitAmountAtLeast(
    priceTooLowMsg,
    listingMinimumPriceSubUnits
  );

  return listingMinimumPriceSubUnits
    ? validators.composeValidators(priceRequired, minPriceRequired)
    : priceRequired;
};

/**
 * If stock type is changed to infinity (on the fly),
 * we show checkbox for providers to update their current stock to infinity.
 * This is created to avoid overselling problem, if operator changes stock type
 * from finite to infinite. I.e. the provider notices, if stock management configuration has changed.
 *
 * Note 1: infinity is faked using billiard aka 10^15
 * Note 2: If stock is less than a million (10^6) items, we show this checkbox component.
 *
 * @param {Object} props contains { hasInfiniteStock, currentStock, formId, intl }
 * @returns a component containing checkbox group (stockTypeInfinity) with one key: infinity
 */
const UpdateStockToInfinityCheckboxMaybe = ({ hasInfiniteStock, currentStock, formId, intl }) => {
  return hasInfiniteStock && currentStock != null && currentStock < MILLION ? (
    <div className={css.input}>
      <p>
        <FormattedMessage
          id="EditListingPricingAndStockForm.updateToInfiniteInfo"
          values={{
            currentStock,
            b: msgFragment => <b>{msgFragment}</b>,
          }}
        />
      </p>
      <FieldCheckboxGroup
        id={`${formId}.stockTypeInfinity`}
        name="stockTypeInfinity"
        options={[
          {
            key: 'infinity',
            label: intl.formatMessage({
              id: 'EditListingPricingAndStockForm.updateToInfinite',
            }),
          },
        ]}
        validate={validators.requiredFieldArrayCheckbox(
          intl.formatMessage({
            id: 'EditListingPricingAndStockForm.updateToInfiniteRequired',
          })
        )}
      />
    </div>
  ) : null;
};

export const EditListingPricingAndStockFormComponentPage = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        formId,
        autoFocus,
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        marketplaceCurrency,
        unitType,
        listingMinimumPriceSubUnits,
        listingType,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
        commission,
      } = formRenderProps;

      const providerCommissionPercentage = commission.data.providerCommission.percentage;
      const providerCommissionMinimum = commission.data.providerCommission.minimum_amount

      const customerCommissionPercentage = commission.data.customerCommission.percentage;
      const customerCommissionMinimum = commission.data.customerCommission.minimum_amount
;
      console.log('commission');
      console.log(providerCommissionPercentage, providerCommissionMinimum, customerCommissionPercentage, customerCommissionMinimum);

      const priceValidators = getPriceValidators(
        listingMinimumPriceSubUnits,
        marketplaceCurrency,
        intl
      );
      // Note: outdated listings don't have listingType!
      // I.e. listings that are created with previous listing type setup.
      const hasStockManagement = listingType?.stockType === STOCK_MULTIPLE_ITEMS;
      const stockValidator = validators.numberAtLeast(
        intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockIsRequired' }),
        0
      );
      const hasInfiniteStock = STOCK_INFINITE_ITEMS.includes(listingType?.stockType);
      const currentStock = values.stock;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError, setStockError } = fetchErrors || {};

      const stockErrorMessage = isOldTotalMismatchStockError(setStockError)
        ? intl.formatMessage({ id: 'EditListingPricingAndStockForm.oldStockTotalWasOutOfSync' })
        : intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockUpdateFailed' });


      const [priceEarningValue, setPriceEarningValue] = useState(0); 

      const handleChildChange = (newValue) => {
        if(newValue) {
          setPriceEarningValue(Math.ceil((newValue.amount/100) * ((100-providerCommissionPercentage)/100)));
          console.log('new Value ', newValue);
        } else {
          setPriceEarningValue(0);
        }   
      };

      console.log('marketplaceCurrency');
      console.log(appSettings.getCurrencyFormatting(marketplaceCurrency));
      console.log(appSettings.getCurrencyFormatting(marketplaceCurrency).currencyDisplay);
      console.log(marketplaceCurrency);
    
      return (
        <Form onSubmit={handleSubmit} className={classes}>
          {updateListingError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingAndStockForm.updateFailed" />
            </p>
          ) : null}
          {showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingPricingAndStockForm.showListingFailed" />
            </p>
          ) : null}

          <div className={css.priceContainer}>
            <div className={css.priceTable}>
              <FieldCurrencyInput
                id={`${formId}.price`}
                name="price"
                className={classNames(css.input, css.priceInput)}
                autoFocus={autoFocus}
                label={intl.formatMessage(
                  { id: 'EditListingPricingAndStockForm.pricePerProduct' },
                  { unitType }
                )}
                placeholder={intl.formatMessage({
                  id: 'EditListingPricingAndStockForm.priceInputPlaceholder',
                })}
                currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                validate={priceValidators}
                onChange={handleChildChange}
              />
              <div className={classNames(css.priceEarning)}>
                <label>You earn</label>
                <div id='priceEarning' className={css.priceEarningValue}>${priceEarningValue}</div>          
              </div>
            </div>
            <div>
              <div className={css.priceBuyerFee}>
                The buyer will also pay <span className='css.priceBuyerFeeValue'>$8</span> service fee <a href='#'>Learn more</a>
              </div>

              <div className={classNames(css.priceEarningInfo)}>
                <div className={classNames(css.priceEarningInfoHeader)}>Set your own price</div>
                <div className={classNames(css.priceEarningInfoContent)}>We dont have enough sales data yet for an accurate price recommendation.</div>
              </div>
            </div>            
          </div>

          <UpdateStockToInfinityCheckboxMaybe
            formId={formId}
            hasInfiniteStock={hasInfiniteStock}
            currentStock={currentStock}
            intl={intl}
          />

          {hasStockManagement ? (
            <FieldTextInput
              className={css.input}
              id={`${formId}.stock`}
              name="stock"
              label={intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockLabel' })}
              placeholder={intl.formatMessage({
                id: 'EditListingPricingAndStockForm.stockPlaceholder',
              })}
              type="number"
              min={0}
              validate={stockValidator}
            />
          ) : (
            <Field id="stock" name="stock" type="hidden" className={css.unitTypeHidden}>
              {fieldRenderProps => <input {...fieldRenderProps?.input} />}
            </Field>
          )}
          {setStockError ? <p className={css.error}>{stockErrorMessage}</p> : null}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingPricingAndStockFormComponentPage.defaultProps = {
  fetchErrors: null,
  listingMinimumPriceSubUnits: 0,
  formId: 'EditListingPricingAndStockForm',
};

EditListingPricingAndStockFormComponentPage.propTypes = {
  formId: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  marketplaceCurrency: string.isRequired,
  listingMinimumPriceSubUnits: number,
  unitType: string.isRequired,
  listingType: shape({ stockType: string }).isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
};

const mapStateToProps = state => {
  const { commission } = state.hostedAssets.pageAssetsData;
  return { commission };
};

const EditListingPricingAndStockFormComponent = compose(
  connect(mapStateToProps),
  injectIntl
)(EditListingPricingAndStockFormComponentPage);

export default EditListingPricingAndStockFormComponent;
