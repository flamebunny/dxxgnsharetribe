import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, object, shape, string } from 'prop-types';
import { useHistory } from 'react-router-dom';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { pathByRouteName } from '../../util/routes';
import { hasPermissionToPostListings } from '../../util/userHelpers';
import { NO_ACCESS_PAGE_POST_LISTINGS } from '../../util/urlHelpers';
import { propTypes } from '../../util/types';
import { isErrorNoPermissionToPostListings } from '../../util/errors';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';

import {
  H3,
  Page,
  PaginationLinks,
  UserNav,
  LayoutSingleColumn,
  NamedLink,
  Modal,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import ManageListingCard from './ManageListingCard/ManageListingCard';

import {
  closeListing,
  openListing,
  getOwnListingsById,
  discardDraft,
} from './ManageListingsPage.duck';
import css from './ManageListingsPage.module.css';
import DiscardDraftModal from './DiscardDraftModal/DiscardDraftModal';

const Heading = props => {
  const { listingsAreLoaded, pagination } = props;
  const hasResults = listingsAreLoaded && pagination.totalItems > 0;
  const hasNoResults = listingsAreLoaded && pagination.totalItems === 0;

  return hasResults ? (
    <H3 as="h1" className={css.heading}>
      <FormattedMessage
        id="ManageListingsPage.youHaveListings"
        values={{ count: pagination.totalItems }}
      />
    </H3>
  ) : hasNoResults ? (
    <div className={css.noResultsContainer}>
      <H3 as="h1" className={css.headingNoListings}>
        <FormattedMessage id="ManageListingsPage.noResults" />
      </H3>
      <p className={css.createListingParagraph}>
        <NamedLink className={css.createListingLink} name="NewListingPage">
          <FormattedMessage id="ManageListingsPage.createListing" />
        </NamedLink>
      </p>
    </div>
  ) : null;
};

const PaginationLinksMaybe = props => {
  const { listingsAreLoaded, pagination, page } = props;
  return listingsAreLoaded && pagination && pagination.totalPages > 1 ? (
    <PaginationLinks
      className={css.pagination}
      pageName="ManageListingsPage"
      pageSearchParams={{ page }}
      pagination={pagination}
    />
  ) : null;
};

export const ManageListingsPageComponent = props => {
  const [listingMenuOpen, setListingMenuOpen] = useState(null);
  const [discardDraftModalOpen, setDiscardDraftModalOpen] = useState(null);
  const [discardDraftModalId, setDiscardDraftModalId] = useState(null);
  const history = useHistory();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();

  const {
    currentUser,
    pageAssetsData,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
    listings,
    onCloseListing,
    onDiscardDraft,
    onOpenListing,
    openingListing,
    openingListingError,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled,
    onManageDisableScrolling,
  } = props;

  useEffect(() => {
    if (isErrorNoPermissionToPostListings(openingListingError?.error)) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    }
  }, [openingListingError]);

  const onToggleMenu = listing => {
    setListingMenuOpen(listing);
  };

  const handleOpenListing = listingId => {
    const hasPostingRights = hasPermissionToPostListings(currentUser);

    if (!hasPostingRights) {
      const noAccessPagePath = pathByRouteName('NoAccessPage', routeConfiguration, {
        missingAccessRight: NO_ACCESS_PAGE_POST_LISTINGS,
      });
      history.push(noAccessPagePath);
    } else {
      onOpenListing(listingId);
    }
  };

  const openDiscardDraftModal = listingId => {
    setDiscardDraftModalId(listingId);
    setDiscardDraftModalOpen(true);
  };

  const handleDiscardDraft = () => {
    onDiscardDraft(discardDraftModalId);
    setDiscardDraftModalOpen(false);
    setDiscardDraftModalId(null);
  };



  // ADD COMMISSION to Listings
  const commission = pageAssetsData?.commission === undefined ? 0 : pageAssetsData?.commission; 

  const providerCommissionPercentage = commission?.data?.providerCommission.percentage === undefined ? 0 : commission?.data?.providerCommission.percentage; 
  // providerCommissionMinimum in cents
  const providerCommissionMinimum = commission?.data?.providerCommission.minimum_amount === undefined ? 0 : commission?.data?.providerCommission.minimum_amount; 

  const customerCommissionPercentage = commission?.data?.customerCommission.percentage === undefined ? 0 : commission?.data?.customerCommission.percentage; 
  // customerCommissionMinimum in cents
  const customerCommissionMinimum = commission?.data?.customerCommission.minimum_amount === undefined ? 0 : commission?.data?.customerCommission.minimum_amount; 


  function calculatePricePlusPercentage(originalPrice, percentageIncrease) {
    // Convert percentage to a decimal
    const percentageDecimal = percentageIncrease / 100;

    // Calculate the amount of the increase
    const increaseAmount = originalPrice * percentageDecimal;

    // Add the increase amount to the original price
    const finalPrice = originalPrice + increaseAmount;

    return finalPrice;
  }

  const addCommissionShippingToListings = (listingsWithCommission, commission) => {
    listingsWithCommission.map((listing, i) => {

      if(listing.attributes.price === null){      
        listing.attributes.price = {};  
        listing.attributes.price.amount = 0;
        listing.attributes.price.priceOriginal = 0;
        listing.attributes.price.priceCommission = 0;
        listing.attributes.price.priceCommissionShipping = 0;
      }

      //create safe backup of original price      
      listing.attributes.price.priceOriginal = listing.attributes.price.priceOriginal === undefined ? listing.attributes.price.amount : listing.attributes.price.priceOriginal;
      listing.attributes.publicData.shippingPriceInSubunitsOneItem  = listing.attributes.publicData.shippingPriceInSubunitsOneItem === undefined ? 0 : listing.attributes.publicData.shippingPriceInSubunitsOneItem;

      const calculatePriceCommission = calculatePricePlusPercentage(listing.attributes.price.priceOriginal, commission);
      const calculatePriceCommissionShipping = calculatePriceCommission + listing.attributes.publicData.shippingPriceInSubunitsOneItem;
      
      listing.attributes.price.priceCommission = calculatePriceCommission;
      listing.attributes.price.priceCommissionShipping = calculatePriceCommissionShipping;
      //overwite amount including shipping and commission
      listing.attributes.price.amount = listing.attributes.price.priceCommission;

      return listing;
    })

  } 

  if (commission != null) {
    addCommissionShippingToListings(listings, customerCommissionPercentage);
  }

  // END COMMISSION

  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const listingsAreLoaded = !queryInProgress && hasPaginationInfo;

  const loadingResults = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
      </H3>
    </div>
  );

  const queryError = (
    <div className={css.messagePanel}>
      <H3 as="h2" className={css.heading}>
        <FormattedMessage id="ManageListingsPage.queryError" />
      </H3>
    </div>
  );

  const closingErrorListingId = !!closingListingError && closingListingError.listingId;
  const openingErrorListingId = !!openingListingError && openingListingError.listingId;
  const discardingErrorListingId = !!discardingDraftError && discardingDraft.listingId;

  const panelWidth = 62.5;
  // Render hints for responsive image
  const renderSizes = [
    `(max-width: 767px) 100vw`,
    `(max-width: 1920px) ${panelWidth / 2}vw`,
    `${panelWidth / 3}vw`,
  ].join(', ');

  return (
    <Page
      title={intl.formatMessage({ id: 'ManageListingsPage.title' })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="ManageListingsPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        {queryInProgress ? loadingResults : null}
        {queryListingsError ? queryError : null}

        <div className={css.listingPanel}>
          <Heading listingsAreLoaded={listingsAreLoaded} pagination={pagination} />

          <div className={css.listingCards}>
            {listings.map(l => (
              <ManageListingCard
                className={css.listingCard}
                key={l.id.uuid}
                listing={l}
                isMenuOpen={!!listingMenuOpen && listingMenuOpen.id.uuid === l.id.uuid}
                actionsInProgressListingId={openingListing || closingListing || discardingDraft}
                onToggleMenu={onToggleMenu}
                onCloseListing={onCloseListing}
                onOpenListing={handleOpenListing}
                onDiscardDraft={openDiscardDraftModal}
                hasOpeningError={openingErrorListingId.uuid === l.id.uuid}
                hasClosingError={closingErrorListingId.uuid === l.id.uuid}
                hasDiscardingError={discardingErrorListingId.uuid === l.id.uuid}
                renderSizes={renderSizes}
              />
            ))}
          </div>
          {onManageDisableScrolling && discardDraftModalOpen ? (
            <DiscardDraftModal
              id="ManageListingsPage"
              isOpen={discardDraftModalOpen}
              onManageDisableScrolling={onManageDisableScrolling}
              onCloseModal={() => setDiscardDraftModalOpen(false)}
              onDiscardDraft={handleDiscardDraft}
            />
          ) : null}

          <PaginationLinksMaybe
            listingsAreLoaded={listingsAreLoaded}
            pagination={pagination}
            page={queryParams ? queryParams.page : 1}
          />
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

ManageListingsPageComponent.defaultProps = {
  currentUser: null,
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

ManageListingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  closingListing: shape({ uuid: string.isRequired }),
  closingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  listings: arrayOf(propTypes.ownListing),
  onCloseListing: func.isRequired,
  onOpenListing: func.isRequired,
  openingListing: shape({ uuid: string.isRequired }),
  openingListingError: shape({
    listingId: propTypes.uuid.isRequired,
    error: propTypes.error.isRequired,
  }),
  pagination: propTypes.pagination,
  queryInProgress: bool.isRequired,
  queryListingsError: propTypes.error,
  queryParams: object,
  scrollingDisabled: bool.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { pageAssetsData } = state.hostedAssets || {};  
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
  } = state.ManageListingsPage;
  const listings = getOwnListingsById(state, currentPageResultIds);
  return {
    currentUser,
    pageAssetsData,
    currentPageResultIds,
    listings,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
    discardingDraft,
    discardingDraftError,
  };
};

const mapDispatchToProps = dispatch => ({
  onCloseListing: listingId => dispatch(closeListing(listingId)),
  onOpenListing: listingId => dispatch(openListing(listingId)),
  onDiscardDraft: listingId => dispatch(discardDraft(listingId)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const ManageListingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(ManageListingsPageComponent);

export default ManageListingsPage;
