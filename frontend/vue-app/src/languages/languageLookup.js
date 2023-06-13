/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict';

const lookup = {
  ar: 'Arabic',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  en: 'English',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  he: 'Hebrew',
  hi: 'Hindi',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  ms: 'Malay',
  no: 'Norwegian',
  fa: 'Persian',
  pl: 'Polish',
  pt: 'Portuguese',
  ru: 'Russian',
  es: 'Spanish',
  sv: 'Swedish',
  tr: 'Turkish',
};

const getLanguageList = function (messages) {
  const languageList = [];
  for (var prop in messages) {
    languageList.push({ code: prop, language: lookup[prop] });
  }
  return languageList;
};

export { getLanguageList };
