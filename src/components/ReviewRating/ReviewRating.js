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
        console.log(isFilled);

        return (
          <div>
            <div className={reviewStarClassName}>
              <div className={isFilled ? css.filled : css.unfilled}>X</div>
            </div>
            <IconReviewStar
              key={`star-${star}`}             
              className={classNames(css.reviewStarsSVG, reviewStarClassName)}
              isFilled={star <= rating}
            />
          </div>
        )
      })}
    </span>
  );
};

export default ReviewRating;
