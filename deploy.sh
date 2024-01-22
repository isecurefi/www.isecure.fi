#!/bin/sh

FILES=`grep '.php"' *.php | cut -f 2 -d ':' | cut -f 2-4 -d '"' | sed 's/\.php.*//' | sed 's/^.*"//g' | sed 's/^.*"//g' | sort | uniq | grep -v https`
FILES="$FILES thankyou googlef9de7a9770f69bd9"

echo $FILES |  xargs -I{} -n1 sh -c 'aws s3 cp --cache-control "public, max-age=86400" "$1.html" s3://www2.isecure.fi/' -- {}
aws s3 cp --cache-control "public, max-age=86400" sitemap.xml s3://www2.isecure.fi/sitemap.xml
aws s3 cp --cache-control "public, max-age=86400" fsga762f.txt s3://www2.isecure.fi/fsga762f.txt
aws s3 cp robots.txt s3://www2.isecure.fi/robots.txt
aws s3 cp --cache-control "public, max-age=86400" --recursive js s3://www2.isecure.fi/js/
aws s3 cp --cache-control "public, max-age=86400" --recursive images s3://www2.isecure.fi/images/
aws s3 cp --cache-control "public, max-age=86400" --recursive --exclude "*.css__" css s3://www2.isecure.fi/css/
aws s3 cp --cache-control "public, max-age=86400" --recursive font-awesome s3://www2.isecure.fi/font-awesome/

# scp -r googlef9de7a9770f69bd9.html sitemap.xml fsga762f.txt robots.txt js images css font-awesome ssh.isecure.fi:/var/www/isecure.fi-SSL/

