#! /bin/bash

set -x
VERSIONED_MODE="${VERSIONED_MODE:---minor}"
SAMPLES="${SAMPLES:-15}"

if [ $SAMPLES -le 10 ];
then
  C8="c8 -o ./coverage/versioned"
else
  C8=""
fi

if [[ "${NPM7}" = 1 ]];
then
  $C8 ./node_modules/.bin/versioned-tests $VERSIONED_MODE --all --samples $SAMPLES -i 2 'tests/versioned/*'
else
  $C8 ./node_modules/.bin/versioned-tests $VERSIONED_MODE --samples $SAMPLES -i 2 'tests/versioned/*'
fi

