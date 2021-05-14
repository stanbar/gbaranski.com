+++
title = "Projects"
url = "/projects"
+++

# My projects

All of them are available on my [Github](https://github.com/gbaranski) profile

## Houseflow 

Home automation platform, the project in which I put the most effort. Started it at the very beginning of the programming journey. This project involves a lot of different topics, like networking, electronics, mobile and web development, databases, devops, etc.

Made using 
- [Rust](https://www.rust-lang.org/) for high performance networking services with low memory footprint. My plan is to run that on cheap Raspberry Pi.
- [Go](https://golang.org/) for OAuth2 Server implementation for Google Smart Home Actions.
- [C](https://en.wikipedia.org/wiki/C_(programming_language)) for Embedded devices, including ESP8266.
- [PostgreSQL](https://www.postgresql.org/) as primary database for storing users and devices.

Previously also
- [Typescript](https://www.typescriptlang.org/) for Web application and backend
- [React](https://reactjs.org/) for Web application
- [Flutter](https://flutter.dev/) for mobile application
- [MongoDB](https://www.mongodb.com/) as primary database, abandoned because I wanted to learn more about relational databases
- [MQTT](https://mqtt.org/) as transport layer protocol between embedded devices and services.

## LightMQ

Lightweight client-server messaging protocol. Intented to work for [Houseflow](#houseflow), as a replacement to MQTT which don't really fit into my use-case. Now work is continued under new name Lighthouse at [Houseflow](#houseflow).

Made using [Go](https://golang.org/).

[Github Repository](https://github.com/gbaranski/lightmq)

## Cryptogram

Decentralized P2P messaging app. Allows real-time messaging without server.

Made using [Go](https://golang.org/) and [LibP2P](https://libp2p.io/).

[Github Repository](https://github.com/gbaranski/cryptogram)

## OpenFlavour

My first steps in databases, scraping data from e-cig flavours manufacturers and providing service for [VapeTool](https://vapetool.app/).

Made using Typescript.

[API Github Repository](https://github.com/gbaranski/OpenFlavour-API)

[Scrapers Github Repository](https://github.com/gbaranski/OpenFlavour-Scraper)

