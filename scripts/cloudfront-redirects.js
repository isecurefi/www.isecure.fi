function querySuffix(querystring) {
  var pairs = [];
  var keys = Object.keys(querystring || {});

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    var item = querystring[key];
    var values = item.multiValue || [item];

    for (var j = 0; j < values.length; j += 1) {
      pairs.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(values[j].value),
      );
    }
  }

  return pairs.length > 0 ? "?" + pairs.join("&") : "";
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // API reference paths are a protected compatibility surface on the apex
  // host. Never let the generic canonicalization rules repurpose them.
  if (
    uri === "/wsapi_v2" ||
    uri === "/wsapi_v2.json" ||
    uri.startsWith("/wsapi_v2/")
  ) {
    return request;
  }

  var map = {
    "/thankyou.html": "/thankyou/",
    "/ws-kanava.html": "/web-services/",
    "/ws-api.html": "/",
    "/tiliote": "/camt-053/",
    "/tiliote/": "/camt-053/",
    "/tiliote/index.html": "/camt-053/",
    "/en/tiliote": "/en/camt-053/",
    "/en/tiliote/": "/en/camt-053/",
    "/en/tiliote/index.html": "/en/camt-053/",
    "/se/tiliote": "/se/camt-053/",
    "/se/tiliote/": "/se/camt-053/",
    "/se/tiliote/index.html": "/se/camt-053/",
    "/banking-api": "/",
    "/banking-api/": "/",
    "/banking-api/index.html": "/",
    "/en/banking-api": "/en/",
    "/en/banking-api/": "/en/",
    "/en/banking-api/index.html": "/en/",
    "/se/banking-api": "/se/",
    "/se/banking-api/": "/se/",
    "/se/banking-api/index.html": "/se/",
  };
  var destination = map[uri];

  if (!destination && uri.endsWith("/index.html")) {
    destination = uri.slice(0, -"index.html".length);
  }

  var leaf = uri.slice(uri.lastIndexOf("/") + 1);
  if (
    !destination &&
    uri !== "/" &&
    !uri.endsWith("/") &&
    !leaf.includes(".")
  ) {
    destination = uri + "/";
  }

  if (!destination) {
    return request;
  }

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: {
        value:
          "https://www.isecure.fi" +
          destination +
          querySuffix(request.querystring),
      },
    },
  };
}
