import React from 'react';
import { richText } from '../../util/richText';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 20;

const SectionTextMaybe2 = props => {
  const { text, heading } = props;
  const content = richText(text, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
    breakChars: '/',
  });

  return text ? (
    <div className={css.detailstext}>
      <span>{heading}: </span>
      <span>{content}</span>
    </div>
  ) : null;
};

export default SectionTextMaybe2;
