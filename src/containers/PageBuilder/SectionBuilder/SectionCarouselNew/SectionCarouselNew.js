/**
*  Duplicate SectionCarousel/SectionCarousel.module.css into SectionNewCarousel/SectionNewCarousel.module.css 
*  and SectionCarousel/index.js into SectionNewCarousel/index.js
**/


import React, { useEffect } from 'react';
import { useIntl } from '../../../../util/reactIntl';
import { arrayOf, bool, func, node, number, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import { ListingCard } from '../../../../components';

import Field, { hasDataInFields } from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionCarouselNew.module.css';

import BlockContainer from '../../BlockBuilder/BlockContainer';

const KEY_CODE_ARROW_LEFT = 37;
const KEY_CODE_ARROW_RIGHT = 39;

// The number of columns (numColumns) affects styling and responsive images
const COLUMN_CONFIG = [
  { css: css.oneColumn, responsiveImageSizes: '(max-width: 767px) 100vw, 1200px' },
  { css: css.twoColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 600px' },
  { css: css.threeColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 400px' },
  { css: css.fourColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 290px' },
];




const getIndex = numColumns => numColumns - 1;

const getColumnCSS = numColumns => {
  const config = COLUMN_CONFIG[getIndex(numColumns)];
  return config ? config.css : COLUMN_CONFIG[0].css;
};
const getResponsiveImageSizes = numColumns => {
  const config = COLUMN_CONFIG[getIndex(numColumns)];
  return config ? config.responsiveImageSizes : COLUMN_CONFIG[0].responsiveImageSizes;
};

// Section component that's able to show listings in a carousel
// the number listings visible is defined by "numColumns" prop.
const SectionCarouselNew = props => {
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
    listings,
    options,
  } = props;

  const intl = useIntl();

  const imgSize = getResponsiveImageSizes(numColumns);
  console.log('imgSize');
  console.log(imgSize);

  const sliderContainerId = `${props.sectionId}-container`;
  const sliderId = `${props.sectionId}-slider`;
  const numberOfListings = listings?.length;
  const hasListings = listings.length > 0;

  useEffect(() => {
    const setCarouselWidth = () => {
      if (hasListings) {
        const windowWidth = window.innerWidth;
        const elem = window.document.getElementById(sliderContainerId);
        const scrollbarWidth = window.innerWidth - document.body.clientWidth;
        const elementWidth =
          elem.clientWidth >= windowWidth - scrollbarWidth ? windowWidth : elem.clientWidth;
        const carouselWidth = elementWidth - scrollbarWidth;

        elem.style.setProperty('--carouselWidth', `${carouselWidth}px`);
      }
    };
    setCarouselWidth();

    window.addEventListener('resize', setCarouselWidth);
    return () => window.removeEventListener('resize', setCarouselWidth);
  }, []);

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);

  const onSlideLeft = e => {
    var slider = window.document.getElementById(sliderId);
    const slideWidth = numColumns * slider?.firstChild?.clientWidth;
    slider.scrollLeft = slider.scrollLeft - slideWidth;
    // Fix for Safari
    e.target.focus();
  };

  const onSlideRight = e => {
    var slider = window.document.getElementById(sliderId);
    const slideWidth = numColumns * slider?.firstChild?.clientWidth;
    slider.scrollLeft = slider.scrollLeft + slideWidth;
    // Fix for Safari
    e.target.focus();
  };

  const onKeyDown = e => {
    if (e.keyCode === KEY_CODE_ARROW_LEFT) {
      // Prevent changing cursor position in input
      e.preventDefault();
      onSlideLeft(e);
    } else if (e.keyCode === KEY_CODE_ARROW_RIGHT) {
      // Prevent changing cursor position in input
      e.preventDefault();
      onSlideRight(e);
    }
  };

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
          <h2 className={classNames(css.title, css.fontInter)}><a href="/s">{title.content}</a></h2> 
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>

      ) : null}
      {hasListings ? (
        <div className={css.carouselContainer} id={sliderContainerId}>
          <div
            className={classNames(css.carouselArrows, {
              [css.notEnoughBlocks]: numberOfListings <= numColumns,
            })}
          >
            <button className={css.carouselArrowPrev} onClick={onSlideLeft} onKeyDown={onKeyDown}>
              ‹
            </button>
            <button className={css.carouselArrowNext} onClick={onSlideRight} onKeyDown={onKeyDown}>
              ›
            </button>
          </div>        
          <div
            className={classNames(getColumnCSS(numColumns), css.baseCarousel, css.listingCards)} id={sliderId}
          >

            {listings.map(l => (
              <ListingCard key={'new'+l.id.uuid} listing={l} intl={intl} className={css.block} />
            ))}
            
          </div>
        </div>
      ) : null}
    </SectionContainer>
  );
};

const propTypeOption = shape({
  fieldComponents: shape({ component: node, pickValidProps: func }),
});

SectionCarouselNew.defaultProps = {
  className: null,
  rootClassName: null,
  defaultClasses: null,
  textClassName: null,
  numColumns: 1,
  title: null,
  description: null,
  appearance: null,
  callToAction: null,
  listings: [],
  isInsideContainer: false,
  options: null,
};

SectionCarouselNew.propTypes = {
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
  listings: arrayOf(object),
  isInsideContainer: bool,
  options: propTypeOption,
};

export default SectionCarouselNew;
