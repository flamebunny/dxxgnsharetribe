import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { createSlug } from '../../util/urlHelpers';
import { formatMoney } from '../../util/currency';

import {
  AspectRatioWrapper,
  AvatarMedium,
  H3,
  H4,
  NamedLink,
  ResponsiveImage,
} from '../../components';

import css from './CheckoutPage.module.css';

/**
 * A card that displays the listing and booking details on the checkout page.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.listing} props.listing - The listing
 * @param {string} props.listingTitle - The listing title
 * @param {propTypes.user} props.author - The author
 * @param {propTypes.image} props.firstImage - The first image
 * @param {Object} props.layoutListingImageConfig - The layout listing image config
 * @param {ReactNode} props.speculateTransactionErrorMessage - The speculate transaction error message
 * @param {boolean} props.showPrice - Whether to show the price
 * @param {string} props.processName - The process name
 * @param {ReactNode} props.breakdown - The breakdown
 * @param {intlShape} props.intl - The intl object
 */
const DetailsSideCard = props => {
  const {
    listing,
    listingTitle,
    priceVariantName,
    author,
    firstImage,
    layoutListingImageConfig,
    speculateTransactionErrorMessage,
    showPrice,
    processName,
    breakdown,
    showListingImage,
    intl,
  } = props;

  const { price, publicData } = listing?.attributes || {};
  const unitType = publicData.unitType || 'unknown';

  const { aspectWidth = 1, aspectHeight = 1, variantPrefix = 'listing-card' } =
    layoutListingImageConfig || {};
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  return (
    <div className={css.detailsContainerDesktop} role="complementary">
      {showListingImage && (
        <AspectRatioWrapper
          width={aspectWidth}
          height={aspectHeight}
          className={css.detailsAspectWrapper}
        >
          <ResponsiveImage
            rootClassName={css.rootForImage}
            alt={listingTitle}
            image={firstImage}
            variants={variants}
          />
        </AspectRatioWrapper>
      )}
      <div className={css.listingDetailsWrapper}>
        <div className={classNames(css.avatarWrapper, { [css.noListingImage]: !showListingImage })}>
          <AvatarMedium user={author} disableProfileLink />
        </div>
        <div
          className={classNames(css.detailsHeadings, { [css.noListingImage]: !showListingImage })}
        >
          <H3 as="h1">
            <NamedLink
              name="ListingPage"
              params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
            >
              {listingTitle}
            </NamedLink>
          </H3>
          {showPrice ? (
            <div className={css.priceContainer}>
              <p className={css.price}>{formatMoney(intl, price)}</p>
              <div className={css.perUnit}>
                <FormattedMessage
                  id="CheckoutPageWithInquiryProcess.perUnit"
                  values={{ unitType }}
                />
              </div>
            </div>
          ) : null}
        </div>
        {speculateTransactionErrorMessage}
      </div>

      {!!breakdown ? (
        <div className={css.orderBreakdownHeader}>
          <H4 as="h2" className={css.orderBreakdownTitle}>
            <FormattedMessage id={`CheckoutPage.${processName}.orderBreakdown`} />
          </H4>
          {priceVariantName ? (
            <div className={css.bookingPriceVariant}>
              <p>{priceVariantName}</p>
            </div>
          ) : null}
        </div>
      ) : null}
      {breakdown}
    </div>
  );
};

export default DetailsSideCard;
