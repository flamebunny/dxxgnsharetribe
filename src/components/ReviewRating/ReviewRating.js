import React from 'react';
import classNames from 'classnames';
import { REVIEW_RATINGS } from '../../util/types';

import { IconReviewStar } from '../../components';
import css from '../Reviews/Reviews.module.css';

/**
 * A component that renders a review rating.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.reviewStarClassName] - Custom class that extends the default class for the review star element
 * @param {1|2|3|4|5} props.rating - The rating to render
 * @returns {JSX.Element}
 */
const ReviewRating = props => {
  const { className, rootClassName, reviewStarClassName, rating } = props;
  const classes = classNames(rootClassName, className);

  const stars = REVIEW_RATINGS;
  return (
    <span className={classes} title={`${rating}/5`}>
      {stars.map(star => {
        const isFilled = star <= rating;

        return (
          <span key={`star-${star}`}>
            <span className={reviewStarClassName}>
              <span className={isFilled ? css.filled : css.unfilled}>X</span>
            </span>
            <IconReviewStar
              className={classNames(css.reviewStarsSVG, reviewStarClassName)}
              isFilled={isFilled}
              ariaLabel={`${star}/5`}
            />
          </span>
        );
      })}
    </span>
  );
};

export default ReviewRating;
