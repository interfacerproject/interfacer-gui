#!/bin/bash

source .env.local
pnpm dlx json-autotranslate -s deepl-free -m i18next -i public/locales -c $DEEPL_API_KEY
