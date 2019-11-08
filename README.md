# Testcase for bug in electron's `net` module in setting proxies

Starting with electron@5, the `session.setProxy` command appears to do nothing. Even though its signature changed 
starting with electron@6, it appears to do nothing in both versions of the function

In this repo, we test this by launching a simple HTTP server and 2 proxies, and running a simple script against them
using multiple versions of electron.

Simply do:
```bash
npm i
npm start
```

When running this, we can see that in electron@4, the requests correctly go through the proxy. However, starting with
electron@5, the requests do not follow the proxy at all. Requests that should go through the simple unauthenticated
succeed anyway, but there is no log from the proxy, and those that should go through the authenticated proxy fail
when setting the proxy works (because credentials are not provided), but succeed on electron@5 and greater.
