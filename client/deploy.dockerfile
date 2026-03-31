FROM node:22.14.0 AS build

WORKDIR /app

ENV CYPRESS_INSTALL_BINARY=0

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY ./ ./

RUN npm run build


FROM nginx:1.19.7-alpine

ARG REACT_APP_API_URL

ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g", "daemon off;"]
