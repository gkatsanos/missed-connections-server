#!/bin/bash
docker build -t gkatsanos/isawyou-server .
docker push gkatsanos/isawyou-server

ssh deploy@$DEPLOY_SERVER << EOF
docker pull gkatsanos/isawyou-server
docker stop isawyou-server || true
docker rm isawyou-server || true
docker rmi gkatsanos/isawyou-server:current || true
docker tag gkatsanos/isawyou-server:latest gkatsanos/isawyou-server:current
docker run -d --restart always --name isawyou-server -p 3000:3000 gkatsanos/isawyou-server:current
EOF
