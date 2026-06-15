# NX Solutions — static site served by nginx
FROM nginx:1.27-alpine

# Remove the default nginx config and add ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/nx.conf

# Copy the static site into nginx's web root
COPY . /usr/share/nginx/html

# Drop files that should never be served
RUN rm -rf /usr/share/nginx/html/.git \
           /usr/share/nginx/html/.claude \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/HANDOFF_README.md \
           /usr/share/nginx/html/diag-zoho.html \
           /usr/share/nginx/html/.DS_Store

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost/en/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
