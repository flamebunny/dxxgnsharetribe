import React, { useState } from 'react';
import { bool, func, number, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { intlShape, injectIntl, FormattedMessage , useIntl } from '../../../../util/reactIntl';
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

import {
  isSafeNumber,
  unitDivisor,
  convertUnitToSubUnit,
  convertMoneyToNumber,
  ensureDotSeparator,
  ensureSeparator,
  truncateToSubUnitPrecision,
} from '../../../../util/currency';





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

/**
 * The EditListingPricingAndStockForm component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.formId] - The form id
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {propTypes.listingType} props.listingType - The listing types config
 * @param {string} props.unitType - The unit type (e.g. 'item')
 * @param {string} props.marketplaceCurrency - The marketplace currency (e.g. 'USD')
 * @param {number} props.listingMinimumPriceSubUnits - The listing minimum price sub units
 * @param {boolean} [props.autoFocus] - Whether the form should autofocus
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {boolean} props.updated - Whether the form is updated
 * @param {boolean} props.updateInProgress - Whether the form is updating
 * @param {Object} props.fetchErrors - The fetch errors
 * @param {propTypes.error} [props.fetchErrors.showListingsError] - The show listings error
 * @param {propTypes.error} [props.fetchErrors.updateListingError] - The update listing error
 * @param {Function} props.onSubmit - The submit function
 * @param {string} props.saveActionMsg - The save action message
 * @returns {JSX.Element}
 */
 
export const EditListingPricingAndStockFormComponentPage = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        formId = 'EditListingPricingAndStockForm',
        autoFocus,
        className,
        rootClassName,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        marketplaceCurrency,
        unitType,
        listingMinimumPriceSubUnits = 0,
        listingType,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        values,
        commission,
      } = formRenderProps;
      const intl = useIntl();
      const providerCommissionPercentage = commission.data.providerCommission.percentage;
      
      // providerCommissionMinimum in cents
      const providerCommissionMinimum = commission.data.providerCommission.minimum_amount;

      const customerCommissionPercentage = commission.data.customerCommission.percentage;
      // customerCommissionMinimum in cents
      const customerCommissionMinimum = commission.data.customerCommission.minimum_amount;

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

      const classes = classNames(rootClassName || css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const { updateListingError, showListingsError, setStockError } = fetchErrors || {};

      const stockErrorMessage = isOldTotalMismatchStockError(setStockError)
        ? intl.formatMessage({ id: 'EditListingPricingAndStockForm.oldStockTotalWasOutOfSync' })
        : intl.formatMessage({ id: 'EditListingPricingAndStockForm.stockUpdateFailed' });


      const [earningFormatted, setEarningFormatted] = useState(0); 
      const [earningUnformatted, setEarningUnformatted] = useState(0); 
      const [customerCommission, setCustomerCommissionFormatted] = useState(0); 
      const [customerCommissionUnformatted, setCustomerCommissionUnformatted] = useState(0); 

      const currencyConfig = appSettings.getCurrencyFormatting(marketplaceCurrency);

      const currencConvert = (initialValue, currencyConfig, percentage, minimumValue, modifier) =>{
        if (Number.isNaN(initialValue)) {
          initialValue = 0;
        }

        let commissionValue;
        if(modifier === 'deducted') {
          commissionValue = Math.ceil((initialValue) * ((100-percentage)/100));
          
        }else if(modifier === 'added') {
          commissionValue = Math.ceil((initialValue) * ((percentage)/100));
        }

        commissionValue = ((minimumValue/100) > commissionValue) ? (minimumValue/100) : commissionValue;

        const hasInitialValue = typeof commissionValue === 'number' && !isNaN(commissionValue);

        const testSubUnitFormat = intl.formatNumber('1.1', currencyConfig);
        const usesComma = testSubUnitFormat.indexOf(',') >= 0;

        try {
          // whatever is passed as a default value, will be converted to currency string
          // Unformatted value is digits + localized sub unit separator ("9,99")
          const unformattedValue = hasInitialValue
            ? truncateToSubUnitPrecision(
                ensureSeparator(commissionValue.toString(), usesComma),
                unitDivisor(currencyConfig.currency),
                usesComma
              )
            : '';
          // Formatted value fully localized currency string ("$1,000.99")
          const formattedValue = hasInitialValue
            ? intl.formatNumber(ensureDotSeparator(unformattedValue), currencyConfig)
            : '';
    
          return ({formattedValue: formattedValue, unformattedValue: unformattedValue})

        } catch (e) {
          log.error(e, 'currency-input-init-failed', { currencyConfig, commissionValue });
          throw e;
        }
      }

      let providerValueObj;
      let customerValueObj;

      const handleChildChange = (newValue) => {
        providerValueObj = currencConvert(newValue, currencyConfig, providerCommissionPercentage, providerCommissionMinimum, 'deducted');     
        setEarningFormatted(providerValueObj.formattedValue);          
        setEarningUnformatted(providerValueObj.unformattedValue);
        customerValueObj = currencConvert(newValue, currencyConfig, customerCommissionPercentage, customerCommissionMinimum, 'added');  
        setCustomerCommissionFormatted(customerValueObj.formattedValue);          
        setCustomerCommissionUnformatted(customerValueObj.unformattedValue); 
      };

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
                <div id='priceEarning' className={css.priceEarningValue}>{earningFormatted}</div>          
              </div>
            </div>
            <div>
              <div className={css.priceBuyerFee}>
                The buyer will also pay <span className='css.priceBuyerFeeValue'>{customerCommission}</span> service fee <a href='#'>Learn more</a>
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
              onWheel={e => {
                // fix: number input should not change value on scroll
                if (e.target === document.activeElement) {
                  // Prevent the input value change, because we prefer page scrolling
                  e.target.blur();

                  // Refocus immediately, on the next tick (after the current function is done)
                  setTimeout(() => {
                    e.target.focus();
                  }, 0);
                }
              }}
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

  const commission = state.hostedAssets.pageAssetsData?.commission;
  return { commission };
}

const EditListingPricingAndStockForm = compose(
  connect(mapStateToProps),
  injectIntl
)(EditListingPricingAndStockFormComponentPage);

export default EditListingPricingAndStockForm;
