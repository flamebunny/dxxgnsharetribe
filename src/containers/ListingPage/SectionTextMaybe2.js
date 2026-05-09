import React from 'react';
import { richText } from '../../util/richText';

import css from './ListingPage.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 20;

const SectionTextMaybe2 = props => {
  const { text, heading, showAsIngress = false } = props;
  const textClass = showAsIngress ? css.sectionTextMaybe2Ingress : css.sectionTextMaybe2Text;
  const content = richText(text, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
    breakChars: '/',
  });

  return text ? (
    <div className={css.sectionTextMaybe2}>
      {heading ? <span className={css.sectionTextMaybe2Heading}>{heading}</span> : null}
      <span className={textClass}>{content}</span>
    </div>
  ) : null;
};

export default SectionTextMaybe2;
