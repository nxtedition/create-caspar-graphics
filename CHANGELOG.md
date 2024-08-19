# CHANGELOG

## v3.0.0

Added better support for building responsive graphics. See https://gfx.nxtedition.com/docs/responsive for more information.

**Breaking:**

All fixed size graphics need to specify their width and height in manifest.json. E.g. if your existing graphics only support being played in 1920x1080 pixels, you should add this to each graphic's manifest.json file: 

```json
{
  "width": 1920,
  "height": 1080
}
```

