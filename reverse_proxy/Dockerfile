FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY certificate.crt /etc/cert/certificate.crt

COPY certificate.key /etc/cert/certificate.key

EXPOSE 80 433

CMD ["nginx","-g", "daemon off;"]