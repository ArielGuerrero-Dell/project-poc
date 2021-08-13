FROM harbor.dell.com/devops-images/nodejs-mini-devops:12-lts_v4.0.0 as node
LABEL maintainer="parri.pandian@dell.com"
WORKDIR /home/nodejs/app
COPY package.json ./
RUN chmod +X /home/nodejs/app/*.*
RUN npm install
#COPY ./target/package ./ # Need this line for CI/CD Pipeline Build
COPY ./ ./
CMD ["npm", "start"]
