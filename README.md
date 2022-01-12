# NOTE

This repo is no longer maintained.

# GGTU Map API

## Description

This is a backend for an interactive map of [GGTU](http://ggtu.ru/).

Related repos:
- [Admin panel repo](https://github.com/ksenkso/ggtu-maps-admin)
- [Map library (API client and renderer)](https://github.com/ksenkso/ggtu-map)
- [Map client](https://github.com/ksenkso/ggtu-map-client)
- [Map parsing tool](https://github.com/ksenkso/ggtu-map-tool)
- [Map transformation tool](https://github.com/ksenkso/ggtu-map-too)

## Features

- Serving maps in SVG;
- Search for objects (like buildings, cabinets, etc.);
- Pathfinding;

##### Routing         : Express
##### ORM Database    : Sequelize
##### Authentication  : Passport, JWT

## Installation

Clone and install

```bash
git clone https://github.com/ksenkso/ggtu-map-api.git
cd ggtu-map-api
npm i
```

Create .env File

You will find a example.env file in the home directory. Paste the contents of that into a file named .env in the same directory. 
Fill in the variables to fit your application

