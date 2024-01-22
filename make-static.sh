#!/bin/sh

FILES=`grep '.php"' *.php | cut -f 2 -d ':' | cut -f 2-4 -d '"' | sed 's/\.php.*//' | sed 's/^.*"//g' | sed 's/^.*"//g' | sort | uniq | grep -v https`
FILES="$FILES thankyou"

echo "Creating HTML files.."
echo $FILES | xargs -I{} -n1 sh -c 'php "$1.php" > "$1.html__"' -- {}
echo $FILES | xargs -I{} -n1 sh -c './node_modules/.bin/html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true "$1.html__" > "$1.html"' -- {}
rm *.html__

echo "Creating compacted and combined CSS file.."
cat css/bootstrap.min.css__ css/modern-business.css__  font-awesome/css/font-awesome.min.css css/isecure.css__ > css/combined.css__
./node_modules/.bin/postcss css/combined.css__ > css/combined.css
/bin/rm -f css/combined.css__

# Change hrefs from .php to .html
echo $FILES | xargs -I{} -n1 sh -c 'gsed -i "s/\.php/.html/g" $1.html ' -- {}

