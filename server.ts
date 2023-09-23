/// <reference types="bun-types" />

import serveStatic from "serve-static-bun";
import { RequestLike, Router, json } from "itty-router";
import { readdir } from "fs/promises";

const router = Router();

const handler = serveStatic("dist");

interface TimedRequest extends RequestLike {
  startTime: number;
}

const clientHandlers = {
  notFound: () => console.log("Script Not Found"),

  serverError: () => console.log("Server Error"),
};

// Removes `() => ` from a function
const returnHandler = (handler: () => void) =>
  new Response(handler.toString().substring(6), {
    headers: {
      "content-type": "text/javascript",
    },
  });

const error = (err: Error, req: Request) => {
  const url = new URL(req.url);
  console.error(`Request to ${url.pathname} errored`);
  console.error(err);
  return returnHandler(clientHandlers.serverError);
};

function logger(req: RequestLike, init: true): Promise<RequestLike>;
function logger(req: RequestLike): void;
function logger(req: RequestLike, init?: true) {
  if (init) {
    (req as TimedRequest).startTime = Date.now();
    return Promise.resolve(req);
  }

  const url = new URL(req.url);

  console.log(
    `[${req.method}] ${url.pathname} (${
      Date.now() - (req as TimedRequest).startTime
    }ms)`
  );
}

router.get("/files", async () => {
  const files = await readdir("dist");
  return files.filter((file) => !file.startsWith("_"));
});

router.get("*", async (req) => {
  const res = await handler(req);

  if (res.status === 404) {
    console.log("Script Not Found");

    return returnHandler(clientHandlers.notFound);
  }

  return res;
});

Bun.serve({
  fetch: (req) =>
    logger(req, true)
      .then(router.handle)
      .then(json)
      .catch((err: Error) => error(err, req))
      .finally(() => logger(req)),
  port: 8080,
});
