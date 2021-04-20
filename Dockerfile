FROM node:14-slim AS builder
ARG NPM_TOKEN
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ARG PUBLIC_URL=/
ENV PUBLIC_URL=${PUBLIC_URL}
ARG REACT_APP_ENV=development
ENV REACT_APP_ENV=${REACT_APP_ENV}

FROM nginx:1.19-alpine
RUN rm -rf /etc/nginx/conf.d
COPY docker/nginx /etc/nginx
RUN mkdir -p /usr/share/nginx/html
COPY /dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
