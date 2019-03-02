#!/bin/bash
git config --global push.default simple # we only want to push one branch — master
# specify the repo on the live server as a remote repo, and name it 'production'
# <user> here is the separate user you created for deploying
git remote add old https://github.com/ksenkso/ggtu-map-api.git
git remote add production ssh://root@37.140.199.148/app
git fetch --unshallow old
git push production master # push our updates
ssh root@37.140.199.148 << EOF
cd /app
npm install
EOF