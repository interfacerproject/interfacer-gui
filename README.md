

<div align="center">

# Interfacer GUI

### Interfacer's Progressive Web App client

This is a Progressive Web App (PWA) acting as Graphical User Interface (GUI) and crypto wallet (end-to-end crypto) for the [Interfacer project](https://interfacerproject.eu). We are developing this component for the FabCityOS, an innovative federated open source platform to share and collaborate on Open Source Hardware projects.

FabCityOS provides innovative tools to support the complexity of a distributed accounting system for flexible collaboration processes, it leverages crypto technology to empower participants with privacy, transparency and data ownership and can be adopted to implement fair and equitable compensation mechanisms.

</div>

<p align="center">
  <a href="https://dyne.org">
    <img src="https://files.dyne.org/software_by_dyne.png" width="170">
  </a>

[![Interfacer-gui](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/nqct2i/main&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/nqct2i/runs)

</p>

## Building the digital infrastructure for Fab Cities

<br>
<a href="https://www.interfacerproject.eu/">
  <img alt="Interfacer project" src="https://dyne.org/images/projects/Interfacer_logo_color.png" width="350" />
</a>
<br>

### What is **INTERFACER?**

The goal of the INTERFACER project is to build the open-source digital infrastructure for Fab Cities.

Our vision is to promote a green, resilient, and digitally-based mode of production and consumption that enables the greatest possible sovereignty, empowerment and participation of citizens all over the world.
We want to help Fab Cities to produce everything they consume by 2054 on the basis of collaboratively developed and globally shared data in the commons.

To know more [DOWNLOAD THE WHITEPAPER](https://www.interfacerproject.eu/assets/news/whitepaper/IF-WhitePaper_DigitalInfrastructureForFabCities.pdf)

## Interfacer GUI Features

{screenshot}

# [LIVE DEMO](https://https://interfacer-gui-staging.dyne.org/)

<br>

<div id="toc">

### 🚩 Table of Contents

- [🎮 Quick start](#-quick-start)
- [💾 Install](#-install)
- [🐋 Docker](#-docker)
- [🐝 API](#-api)
- [🔧 Configuration](#-configuration)
- [📋 Testing](#-testing)
- [🔡 Translations](#-translations)
- [🐛 Troubleshooting & debugging](#-troubleshooting--debugging)
- [😍 Acknowledgements](#-acknowledgements)
- [🌐 Links](#-links)
- [👤 Contributing](#-contributing)
- [💼 License](#-license)

</div>


***
## 🎮 Quick start

To start using Interfacer GUI run the following commands

```bash
docker pull ghcr.io/interfacerproject/interfacer-gui:main
docker run -it -p 3000:3000 ghcr.io/interfacerproject/interfacer-gui:main
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**[🔝 back to top](#toc)**

***
## 💾 Install

```bash
git submodule update --init
# then install the dependencies
pnpm i

# copy and fill the env variables from the example provided
cp .env.example .env.local

# to run the software slower but with livereload and watch
pnpm dev

# or build & start it for faster execution
pnpm build
pnpm start
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**[🔝 back to top](#toc)**

***
## 🐋 Docker

```bash
docker pull ghcr.io/interfacerproject/interfacer-gui:main
```

**[🔝 back to top](#toc)**

***
## 🔧 Configuration

Default values are available on the [`.env.example`](.env.example) of this repository.


- DEEPL_API_KEY Deepl key api used in i18n module for auto-translation
- BASE_URL the federated instance of the gateway
- NEXT_PUBLIC_LOSH_ID The LUID designated as the owner of the LOSH imported assets
- NEXT_PUBLIC_ZENFLOWS_ADMIN The admin key of the federated zenflows instance
- NEXT_PUBLIC_INVITATION_KEY The invitation key needed to register new users

The next are derived services (endpoints of the instance microservice)
- NEXT_PUBLIC_ZENFLOWS_URL=$BASE_URL/zenflows/api
- NEXT_PUBLIC_ZENFLOWS_FILE_URL=$BASE_URL/zenflows/api/file
- NEXT_PUBLIC_LOCATION_AUTOCOMPLETE=$BASE_URL/location-autocomplete/
- NEXT_PUBLIC_LOCATION_LOOKUP=$BASE_URL/location-lookup/
- NEXT_PUBLIC_INBOX_SEND=$BASE_URL/inbox/send
- NEXT_PUBLIC_INBOX_READ=$BASE_URL/inbox/read
- NEXT_PUBLIC_INBOX_COUNT_UNREAD=$BASE_URL/inbox/count-unread
- NEXT_PUBLIC_INBOX_SET_READ=$BASE_URL/inbox/set-read
- NEXT_PUBLIC_WALLET=$BASE_URL/wallet/token

**[🔝 back to top](#toc)**

***

## 📋 Testing

E2E testing is provided via cypress.io and runnable locally via:

```bash
# in headless mode
pnpm test
# or by runnign cypress instance
pnpm e2e
```

**[🔝 back to top](#toc)**
***

## 🔡 translations

`pnpm translate`

**[🔝 back to top](#toc)**

***
## 🐛 Troubleshooting & debugging

Available bugs are reported in the [Issues page](../../issues)

**[🔝 back to top](#toc)**

***
## 😍 Acknowledgements

<a href="https://dyne.org">
  <img src="https://files.dyne.org/software_by_dyne.png" width="222">
</a>

Copyleft (ɔ) 2022 by [Dyne.org](https://www.dyne.org) foundation, Amsterdam

Designed, written and maintained by Ennio Donato, Micol Salomone, Giovanni Abbatepaolo and Puria Nafisi Azizi.

**[🔝 back to top](#toc)**

***
## 🌐 Links

https://www.interfacer.eu/

https://dyne.org/

**[🔝 back to top](#toc)**

***
## 👤 Contributing

1.  🔀 [FORK IT](../../fork)
2.  Create your feature branch `git checkout -b feature/branch`
3.  Commit your changes `git commit -am 'Add some fooBar'`
4.  Push to the branch `git push origin feature/branch`
5.  Create a new Pull Request
6.  🙏 Thank you


**[🔝 back to top](#toc)**

***
## 💼 License
    Interfacer GUI - Interfacer's Progressive Web App client
    Copyleft (ɔ) 2022 Dyne.org foundation

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

**[🔝 back to top](#toc)**
