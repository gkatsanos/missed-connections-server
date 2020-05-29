#!/bin/bash
docker build -t gkatsanos/server .
docker push gkatsanos/server

ssh deploy@$DEPLOY_SERVER << EOF
docker pull gkatsanos/server
docker stop server || true
docker rm server || true
docker rmi gkatsanos/server:current || true
docker tag gkatsanos/server:latest gkatsanos/server:current
docker run -d --restart always --name server -p 3001:3001 gkatsanos/server:current
EOF
