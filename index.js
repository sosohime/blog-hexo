const Koa = require("koa");
const BodyParser = require("koa-bodyparser");
const Router = require("koa-router");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = new Koa();
const router = new Router();

app.use(BodyParser());
router.post(process.env.update_hexo_blog_path, async (ctx) => {
  const body = ctx.request.body || {};
  if (body.event === "update-hexo-blog" && body.token === process.env.update_hexo_blog_token) {
    const { stdout, stderr } = await exec('git pull && hexo g');
    if(stderr) {
        ctx.body = {
            code: -1,
            error: stderr,
        };
    } else {
        ctx.body = {
            code: 0,
            message: "success",
          };
    }
  } else {
    ctx.body = {
      code: 405,
    };
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3378);
console.log('start listen 3378')