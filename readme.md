# Self hosted media manager

# Demo

https://mm.dmitrypodgorniy.com

- login: demo
- password: 123

## Features

- Media
    - Autofit layout for preview mode
    - Tagging
    - Operations on selection of media
        - shift+click to add/remove media from selection
        - adding/removing tags
        - adding/removing from collection
    - By default all media is accessible only by owner (even direct links to media)
    - Share links to individual media files
    - Zoomed view
        - Zoom even more (mouse wheel)
        - Drag aground
- Tags
    - Filter media by tags.
    - Media us auto tagged (tags based on media type type, shared files are tagged)
- Collections
    - Create, delete, rename
    - Public and private collections
    - Optional password for public collections


## Running application with Docker

Prerequisites:

- docker

Check environment variables for configuration in `docker-compose.yml` and default values in `.env` file.

For example:

Create account `dima` (if created password will be changed) with password `ppp` and run web app on `8888` port:

```
export ACCOUNT_NAME=dima && export ACCOUNT_PASSWORD=ppp && export EXPOSED_PORT=8888 && docker-compose up --build -d
```


### Manual installation

Prerequisites:

- nodejs
- mongodb
- ffmpeg

Install production dependencies

```
npm install --production
```

Override environment variables from `.env` file an run

```
npm run prod
```


## Development

Prerequisites:

- nodejs
- mongodb
- ffmpeg

Runs in demo mode: account `demo` with password `123` created.

```
npm install
npm run dev
```