#!/bin/bash

source .env.local
pnpx -y json-autotranslate -s deepl-free -i public/locales -c $DEEPL_API_KEY
