FROM nginx:alpine
RUN hugo --gc --minify --environment production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
