# Caspar Graphics Examples

These examples are published to https://caspar-graphics-examples.vercel.app, so that they can be loaded from
our docs site. 

Ideally we should let Vercel deploy when pushing to GitHub, but there are currently some issues 
with platform specific dependencies (see https://github.com/npm/cli/issues/4828), so for now we're
doing it manually using the [CLI tool](https://vercel.com/docs/cli).

To publish a new version run these commands in the root directory: 

```bash 
vercel build && vercel deploy --prebuilt --prod
```
