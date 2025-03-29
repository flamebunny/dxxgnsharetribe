/**
*  Duplicate SectionColumns/SectionColumns.module.css into SectionNewListings/SectionNewListings.module.css 
*  and SectionColumns/index.js into SectionNewListings/index.js
**/

import React from 'react';
import { useIntl } from '../../../../util/reactIntl';
import { arrayOf, bool, func, node, number, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import { ListingCard } from '../../../../components';

import Field, { hasDataInFields } from '../../Field';

import SectionContainer from '../SectionContainer';
import css from './SectionNewListings.module.css';

// The number of columns (numColumns) affects styling and responsive images
const COLUMN_CONFIG = [
  { css: css.oneColumn, responsiveImageSizes: '(max-width: 767px) 100vw, 1200px' },
  { css: css.twoColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 600px' },
  { css: css.threeColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 400px' },
  { css: css.fourColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 265px' },
];
const getIndex = numColumns => numColumns - 1;
const getColumnCSS = numColumns => {
  const config = COLUMN_CONFIG[getIndex(numColumns)];
  return config ? config.css : COLUMN_CONFIG[0].css;
};

// Section component that's able to show blocks in multiple different columns (defined by "numColumns" prop)
const SectionNewListings = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    numColumns,
    title,
    description,
    appearance,
    callToAction,
    isInsideContainer,
    options,
    listings,
  } = props;

  const intl = useIntl();

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);
  const hasListings = listings.length > 0;

  return (
    <SectionContainer
      id={sectionId}
      className={className}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      
      {hasHeaderFields ? (
        <header className={classNames(css.center)}>
          <Field data={title} className={classNames(css.title, css.fontInter)} options={fieldOptions} />
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>
      ) : null}
  
      {hasListings ? (
        <div
          className={classNames(getColumnCSS(numColumns), css.listingCards)}
        >

          {listings.map(l => (
            <ListingCard key={l.id.uuid} listing={l} intl={intl} className={css.box} />
          ))}
              
        </div>
      ) : null}
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionNewListings.defaultProps = {
  className: null,
  rootClassName: null,
  defaultClasses: null,
  textClassName: null,
  numColumns: 1,
  title: null,
  description: null,
  appearance: null,
  callToAction: null,
  blocks: [],
  isInsideContainer: false,
  options: null,
};

SectionNewListings.propTypes = {
  sectionId: string.isRequired,
  className: string,
  rootClassName: string,
  defaultClasses: shape({
    sectionDetails: string,
    title: string,
    description: string,
    ctaButton: string,
  }),
  numColumns: number,
  title: object,
  description: object,
  appearance: object,
  callToAction: object,
  blocks: arrayOf(object),
  isInsideContainer: bool,
  options: propTypeOption,
};

export default SectionNewListings;