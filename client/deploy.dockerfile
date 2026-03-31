FROM node:14.17.3 as build

WORKDIR /app

COPY package.json ./

RUN npm install --only=production

RUN npm install typescript

COPY ./ ./

RUN npm run build


FROM nginx:1.19.7-alpine

ARG REACT_APP_API_URL

ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g", "daemon off;"]
