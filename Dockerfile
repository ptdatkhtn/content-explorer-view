FROM node:14-slim AS builder
ARG REACT_APP_ENV=development
ENV REACT_APP_ENV=${REACT_APP_ENV}

COPY . /app
WORKDIR /app
RUN yarn && yarn build

FROM nginx:1.19-alpine
RUN rm -rf /etc/nginx/conf.d \
 && mkdir -p /usr/share/nginx/html

COPY docker/nginx /etc/nginx
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
