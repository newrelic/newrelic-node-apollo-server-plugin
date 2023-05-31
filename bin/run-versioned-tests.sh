#! /bin/bash

set -x
VERSIONED_MODE="${VERSIONED_MODE:---minor}"
SAMPLES="${SAMPLES:-15}"
C8_REPORTER="${C8_REPORTER:-lcov}"

C8="c8 -o ./coverage/versioned --merge-async -r $C8_REPORTER"

if [[ "${NPM7}" = 1 ]];
then
  $C8 ./node_modules/.bin/versioned-tests $VERSIONED_MODE --all --samples $SAMPLES -i 2 'tests/versioned/*'
else
  $C8 ./node_modules/.bin/versioned-tests $VERSIONED_MODE --samples $SAMPLES -i 2 'tests/versioned/*'
fi

